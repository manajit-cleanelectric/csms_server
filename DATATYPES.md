# API Parameter Datatypes Documentation

This document lists the datatypes for all parameters used in the APIs, matching the database types. Fields with `bigint`, `numeric`, or `decimal` types are represented as `string` in the API.

---

## LedgerEntry
| Field       | Type   | Description                 |
|-------------|--------|-----------------------------|
| id          | string | UUID                        |
| transaction | string | UUID (Transaction ID)       |
| wallet      | string | UUID (Wallet ID)            |
| type        | string | Enum (EntryType)            |
| amount      | string | Numeric/Decimal (as string) |
| memo        | string | Nullable text               |
| createdAt   | string | ISO DateTime                |

## Addresses
| Field     | Type   | Description       |
|-----------|--------|-------------------|
| id        | string | UUID              |
| charger   | string | UUID (Charger ID) |
| line1     | string | Address line 1    |
| line2     | string | Address line 2    |
| location  | string | Location name     |
| city      | string | City              |
| state     | string | State             |
| zipCode   | string | Zip/Postal code   |
| country   | string | Country           |
| createdAt | string | ISO DateTime      |
| updatedAt | string | ISO DateTime      |

## AuthTokens
| Field     | Type   | Description    |
|-----------|--------|----------------|
| id        | string | UUID           |
| user      | string | UUID (User ID) |
| token     | string | Auth token     |
| platform  | string | Platform       |
| location  | string | Location       |
| ipAddress | string | IP Address     |
| createdAt | string | ISO DateTime   |
| updatedAt | string | ISO DateTime   |

## Chargers
| Field         | Type   | Description                    |
|---------------|--------|--------------------------------|
| id            | string | UUID (Charger ID)              |
| model         | string | Model name                     |
| vendor        | string | Vendor name                    |
| serialNumber  | string | Serial number (unique)         |
| maxPower      | number | Maximum power (kW)             |
| alias         | string | Alias (nullable)               |
| city          | string | City                           |
| address       | string | UUID (Address ID)              |
| noOfConnector | number | Number of connectors           |
| latitude      | string | Decimal (as string, latitude)  |
| longitude     | string | Decimal (as string, longitude) |
| status        | string | Enum (ChargerStatus)           |
| sessions      | array  | Array of Session IDs           |
| connectors    | array  | Array of Connector IDs         |
| tariff        | string | UUID (Tariff ID)               |
| lastHeartBeat | string | ISO DateTime (nullable)        |
| createdAt     | string | ISO DateTime                   |
| updatedAt     | string | ISO DateTime                   |

## Connectors
| Field              | Type   | Description                           |
|--------------------|--------|---------------------------------------|
| id                 | string | UUID                                  |
| charger            | string | UUID (Charger ID)                     |
| chargerConnectorId | number | Connector number (unique per charger) |
| type               | string | Enum (ConnectorType)                  |
| status             | string | Enum (ConnectorStatus)                |
| sessions           | array  | Array of Session IDs                  |
| currentSession     | string | UUID (Current Session ID, nullable)   |
| createdAt          | string | ISO DateTime                          |
| updatedAt          | string | ISO DateTime                          |

## FcmTokens
| Field     | Type   | Description    |
|-----------|--------|----------------|
| id        | string | UUID           |
| user      | string | UUID (User ID) |
| token     | string | FCM token      |
| createdAt | string | ISO DateTime   |
| updatedAt | string | ISO DateTime   |

## Heartbeats
| Field     | Type   | Description  |
|-----------|--------|--------------|
| id        | string | UUID         |
| chargerId | string | UUID         |
| timestamp | string | ISO DateTime |
| createdAt | string | ISO DateTime |
| updatedAt | string | ISO DateTime |

## MeterValues
| Field         | Type   | Description     |
|---------------|--------|-----------------|
| id            | string | UUID            |
| chargerId     | string | UUID            |
| connectorId   | number | Connector ID    |
| timestamp     | string | ISO DateTime    |
| sessionId     | number | Session ID      |
| sampledValues | array  | SampledValues[] |
| updatedAt     | string | ISO DateTime    |

## PaymentRequest
| Field     | Type   | Description                 |
|-----------|--------|-----------------------------|
| id        | string | UUID                        |
| user      | string | UUID (User ID)              |
| orderId   | string | Order ID                    |
| amount    | string | Amount (as string)          |
| currency  | string | Currency code               |
| status    | string | Enum (PaymentRequestStatus) |
| createdAt | string | ISO DateTime                |
| updatedAt | string | ISO DateTime                |

## SampledValues
| Field      | Type   | Description           |
|------------|--------|-----------------------|
| id         | string | UUID                  |
| meterValue | string | UUID (MeterValue ID)  |
| value      | string | Value                 |
| context    | string | Enum (ReadingContext) |
| format     | string | Enum (ValueFormat)    |
| measurand  | string | Enum (Measurand)      |
| phase      | string | Enum (Phase)          |
| location   | string | Enum (Location)       |
| unit       | string | Enum (UnitOfMeasure)  |

## Sessions
| Field         | Type   | Description                           |
|---------------|--------|---------------------------------------|
| id            | string | bigint (as string, session ID)        |
| charger       | string | UUID (Charger ID)                     |
| connector     | string | UUID (Connector ID)                   |
| vehicleNo     | string | Vehicle number (nullable)             |
| vehicleVendor | string | Vehicle vendor (nullable)             |
| vehicleModel  | string | Vehicle model (nullable)              |
| user          | string | UUID (User ID, nullable)              |
| startTime     | string | ISO DateTime (session start)          |
| endTime       | string | ISO DateTime (session end, nullable)  |
| meterStart    | string | bigint (as string, nullable)          |
| meterStop     | string | bigint (as string, nullable)          |
| energyUsed    | number | Energy used (nullable)                |
| location      | string | Location (nullable)                   |
| socStart      | number | State of charge at start (nullable)   |
| socLast       | number | State of charge at last (nullable)    |
| reason        | string | Enum (Reason, nullable)               |
| status        | string | Enum (SessionStatus)                  |
| baseAmount    | string | Numeric/Decimal (as string, nullable) |
| netCGST       | string | Numeric/Decimal (as string, nullable) |
| netSGST       | string | Numeric/Decimal (as string, nullable) |
| netIGST       | string | Numeric/Decimal (as string, nullable) |
| totalAmount   | string | Numeric/Decimal (as string, nullable) |
| transaction   | string | UUID (Transaction ID, nullable)       |
| createdAt     | string | ISO DateTime                          |
| updatedAt     | string | ISO DateTime                          |

## StatusLogs
| Field           | Type   | Description                  |
|-----------------|--------|------------------------------|
| id              | string | UUID                         |
| chargerId       | string | UUID                         |
| connectorId     | number | Connector ID                 |
| errorCode       | string | Enum (ErrorCode)             |
| status          | string | Enum (ConnectorStatus)       |
| info            | string | Info (nullable)              |
| vendorId        | string | Vendor ID (nullable)         |
| vendorErrorCode | string | Vendor error code (nullable) |
| createdAt       | string | ISO DateTime                 |
| updatedAt       | string | ISO DateTime                 |

## Tariffs
| Field       | Type   | Description         |
|-------------|--------|---------------------|
| id          | string | UUID                |
| pricePerKWh | string | Decimal (as string) |
| CGST        | string | Decimal (as string) |
| SGST        | string | Decimal (as string) |
| IGST        | string | Decimal (as string) |
| createdAt   | string | ISO DateTime        |
| updatedAt   | string | ISO DateTime        |

## Transaction
| Field       | Type   | Description                 |
|-------------|--------|-----------------------------|
| id          | string | UUID                        |
| externalRef | string | External reference          |
| amount      | string | Numeric/Decimal (as string) |
| category    | string | Enum (TxnCategory)          |
| description | string | Nullable text               |
| createdAt   | string | ISO DateTime                |

## Users
| Field               | Type    | Description            |
|---------------------|---------|------------------------|
| id                  | string  | UUID                   |
| phoneNumber         | string  | Phone number           |
| firstName           | string  | First name             |
| lastName            | string  | Last name              |
| vehicles            | array   | Array of Vehicle IDs   |
| wallet              | string  | UUID (Wallet ID)       |
| sessions            | array   | Array of Session IDs   |
| authTokens          | array   | Array of AuthToken IDs |
| city                | string  | City (nullable)        |
| state               | string  | State (nullable)       |
| email               | string  | Email (nullable)       |
| isEmailVerified     | boolean | Email verified         |
| isAccountApproved   | boolean | Account approved       |
| isProfileComplete   | boolean | Profile complete       |
| isVehicleRegistered | boolean | Vehicle registered     |
| isActive            | boolean | Active                 |
| isDeleted           | boolean | Deleted                |
| createdAt           | string  | ISO DateTime           |
| updatedAt           | string  | ISO DateTime           |

## Vehicles
| Field      | Type    | Description                   |
|------------|---------|-------------------------------|
| id         | string  | UUID                          |
| user       | string  | UUID (User ID, nullable)      |
| model      | string  | Model name (nullable)         |
| vendor     | string  | Vendor name (nullable)        |
| vin        | string  | Vehicle Identification Number |
| bin        | string  | BIN (nullable)                |
| vehicleNo  | string  | Vehicle number (nullable)     |
| rcNumber   | string  | RC number (nullable)          |
| isApproved | boolean | Approved                      |
| rcImageUrl | string  | RC image URL (nullable)       |
| createdAt  | string  | ISO DateTime                  |
| updatedAt  | string  | ISO DateTime                  |

## Wallet
| Field     | Type   | Description                 |
|-----------|--------|-----------------------------|
| id        | string | UUID                        |
| user      | string | UUID (User ID) or null      |
| type      | string | Enum (WalletType)           |
| currency  | string | Currency code               |
| code      | string | Wallet code                 |
| balance   | string | Numeric/Decimal (as string) |
| createdAt | string | ISO DateTime                |
| updatedAt | string | ISO DateTime                |

---

**Note:**
- All `bigint`, `numeric`, and `decimal` fields are represented as `string` in the API.
- Enum fields are represented as `string` with allowed values as per the model.
- Date/time fields are represented as ISO 8601 strings.
- Relations (foreign keys) are represented as UUID strings unless otherwise noted.
