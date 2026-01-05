import {validate} from "uuid";
import {getUserWallet} from "../controllers/wallet.controller";
import {Sessions, SessionStatus} from "../models/session.model";
import {In} from "typeorm";
import {sendRemoteStopTransaction} from "../controllers/session.controller";
import {logger} from "./logger.service";

async function moneyCheckerService(userId: string) {
    if (!userId) {
        return;
    }
    if (!validate(userId)) {
        return;
    }
    const wallet = await getUserWallet(userId);
    if (!wallet) {
        return;
    }
    const currentSessions = await Sessions.find({
        where: {
            user: {id: userId},
            status: In([SessionStatus.CHARGING, SessionStatus.IDLE, SessionStatus.SUSPENDED])
        },
        relations: ['charger.tariff']
    });
    let consumptionAmount = 0;
    for (const session of currentSessions) {
        if (!session.charger.tariff) {
            continue;
        }
        const { pricePerKWh = 0, CGST = 0, SGST = 0, IGST = 0 } = session.charger.tariff || {};
        const taxFraction = (CGST / 100) + (SGST / 100) + (IGST / 100);
        let totalCostSoFar = (((session.energyUsed / 1000) * pricePerKWh) * (1 + taxFraction))
        totalCostSoFar = Math.round((totalCostSoFar + Number.EPSILON) * 100) / 100;
        consumptionAmount += totalCostSoFar;
    }
    if (parseFloat(wallet.balance) <= consumptionAmount) {
        const sessionStopPromises = currentSessions.map(session => {
            logger.info(`Sending remote stop for session ${session.id} due to insufficient funds.`);
            return sendRemoteStopTransaction(session.charger.id, session.id);
        })
        const resolves = await Promise.all(sessionStopPromises);
        const stopResults = currentSessions.map((session, idx) => ({
            sessionId: session.id,
            resolved: Boolean(resolves[idx])
        }));
        logger.info(`Remote stop results due to insufficient funds resolved: ${JSON.stringify(stopResults)}`);
    }
    return;
}

export {
    moneyCheckerService,
};