const fs = require('fs');
const { get } = require('http');
const path = require('path');

const connectedChargePoints = new Map();
const pendingChargePoints = new Map();
const ongoingTransactions = new Map();

async function handleOcppClient(client) {

  console.log(`New OCPP client connected: ${client.identity}`);

  // Store client reference
  connectedChargePoints.set(client.identity, {
    client,
    connectedAt: client.session.connectedAt,
    lastHeartbeat: new Date().toISOString(),
    status: 'Available'
  });
  
  // OCPP event handlers (BootNotification, Heartbeat, etc.)
  client.handle('BootNotification', ({params}) => {
    const { chargePointModel, chargePointVendor } = params;

    connectedChargePoints.set(client.identity, {
      ...prev,
      model: chargePointModel,
      vendor: chargePointVendor,
      status: 'Connected',
      lastSeen: new Date()
    });
    console.log(`Charge Point ${chargePointId} connected: ${chargePointModel} by ${chargePointVendor}`);
    
    return { 
      currentTime: new Date().toISOString(),
      interval: 10, // Heartbeat interval in seconds
      status: 'Accepted'
    };
  });

  client.handle('Heartbeat', ({params}) => {
    const chargePointId = client.identity;

    if (connectedChargePoints.has(chargePointId)) {
      const chargePointData = connectedChargePoints.get(chargePointId);
      chargePointData.lastHeartbeat = new Date().toISOString();
      connectedChargePoints.set(chargePointId, chargePointData);
      console.log(`Heartbeat received from ${chargePointId}`);
    }
    
    return {
      currentTime: new Date().toISOString()
    };
  });

  client.handle('MeterValues', ({params}) => {
    const { meterValue, connectorId, transactionId } = params;
    const chargePointId = client.identity;

    meterValue.forEach(value => {
      const dataDir = path.join(process.cwd(), 'meterValues');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
      }

      const filePath = path.join(dataDir, `${transactionId}_${client.identity}.json`);
      let meterData = [];
      if (fs.existsSync(filePath)) {
        meterData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      meterData.push({
        timestamp: value.timestamp,
        sampledValue: value.sampledValue,
        connectorId,
        transactionId
      });
      fs.writeFileSync(filePath, JSON.stringify(meterData, null, 2));
    });
    console.log(`Meter values received from ${chargePointId} for transaction ${transactionId}`);

    return {};
  });

  client.handle('StatusNotification', ({params}) => {
    const { status } = params;
    const chargePointId = client.identity;

    if (connectedChargePoints.has(chargePointId)) {
      const chargePointData = connectedChargePoints.get(chargePointId);
      chargePointData.status = status;
      chargePointData.lastSeen = new Date();
      connectedChargePoints.set(chargePointId, chargePointData);
      console.log(`Status notification from ${chargePointId}: ${status}`);
    }

    return {};
  });
  
  client.handle('Authorize', ({params}) => {
    const { idTag } = params;
    const chargePointId = client.identity;

    pendingChargePoints.set(chargePointId, {
      idTag,
      status: 'Pending',
      timestamp: new Date().toISOString()
    });
    console.log(`Authorization request from ${chargePointId} for ID Tag: ${idTag}`);

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!pendingChargePoints.has(chargePointId)) {
          clearInterval(interval);
          resolve({
            idTagInfo: {
              status: 'Accepted'
            }
          });
        }
      }, 500);
    });
  });

  client.handle('StartTransaction', ({params}) => {
    const { idTag, meterStart, timestamp, connectorId } = params;
    const chargePointId = client.identity;

    const transactionId = timestamp.toISOString() + '_' + chargePointId;
    ongoingTransactions.set(chargePointId, {
      idTag,
      meterStart,
      timestamp,
      connectorId,
      transactionId,
      status: 'Started'
    });
    console.log(`Transaction started for ${chargePointId} with ID Tag: ${idTag}, Transaction ID: ${transactionId}`);
    return {
      transactionId,
      idTagInfo: {
        status: 'Accepted'
      }
    };
  });

  client.handle('RemoteStopTransaction', ({params}) => {
    const { transactionId } = params;
    const chargePointId = client.identity;

    if (ongoingTransactions.has(chargePointId)) {
      ongoingTransactions.delete(chargePointId);
      console.log(`Remote stop transaction for ${chargePointId}, Transaction ID: ${transactionId}`);
      return { status: 'Accepted' };
    } else {
      console.log(`No ongoing transaction found for ${chargePointId}, Transaction ID: ${transactionId}`);
      return { status: 'Rejected' };
    }
  });
}

function getAllChargePoints() {
  const chargePoints = Array.from(connectedChargePoints.entries()).map(([id, data], idx) => ({
    no: idx + 1,
    id
  }));
  return chargePoints;
}

function getPendingRequests() {
  const pendingRequests = Array.from(pendingChargePoints.entries()).map(([id, data], idx) => ({
    no: idx + 1,
    id,
    idTag: data.idTag,
    status: data.status,
    timestamp: data.timestamp
  }));
  return pendingRequests;
}

function startcharging(chargePointId) {
  if (pendingChargePoints.has(chargePointId)) {
    pendingChargePoints.delete(chargePointId);
  }

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (ongoingTransactions.has(chargePointId)) {
        clearInterval(interval);
        const transactionId = ongoingTransactions.get(chargePointId).transactionId;
        resolve({ status: 'Charging started', transactionId: transactionId });
      }
    }, 500);
  });
}
  
function stopcharging(chargePointId) {
  if (ongoingTransactions.has(chargePointId)) {
    const transactionId = ongoingTransactions.get(chargePointId).transactionId;
    connectedChargePoints.get(chargePointId).client.send('RemoteStopTransaction', { transactionId });

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!ongoingTransactions.has(chargePointId)) {
          clearInterval(interval);
          resolve({ status: 'Charging stopped', transactionId });
        }
      }, 500);
    });
  }
  return { status: 'No ongoing transaction found for this charge point' };
}

module.exports = { handleOcppClient, getAllChargePoints, getPendingRequests, startcharging, stopcharging };
