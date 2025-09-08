import {EachMessageHandler, EachMessagePayload} from "kafkajs";
import {parentPort} from "worker_threads";
import * as inspector from "node:inspector";
import {Sessions} from "../../models/session.model";
import {Wallet} from "../../models/wallet.model";
import {LedgerService} from "../../services/ledger.service";
import {EntryType, TxnCategory} from "../../utils/enums";
import {toAmountString} from "../../utils/money";

/**
 * Processor for handling session-related Kafka messages.
 * @param payload - The message payload containing topic, partition, message, heartbeat, and pause function.
 * @returns A promise that resolves when message processing is complete.
 */
const sessionMessageProcessor: EachMessageHandler = async (payload: EachMessagePayload): Promise<void> => {
    const {topic, partition, message, heartbeat, pause} = payload;
    parentPort?.postMessage(`Received message on topic ${topic}, partition ${partition}`);
    switch (topic) {
        case ('session_completion'): {
            try {
                const {key, value} = message;
                const sessionId = parseInt(key?.toString()!);
                const chargingSession = await Sessions.findOneOrFail({
                    where: {id: sessionId},
                    relations: ["charger.tariff", "user", "transaction"],
                });

                if (chargingSession.transaction) {
                    break;
                }

                // Calculate Base Amount
                let baseAmount = (chargingSession.energyUsed / 1000) * (chargingSession.charger.tariff?.pricePerKWh);
                baseAmount = Math.round((baseAmount + Number.EPSILON) * 100) / 100;

                // Calculate Taxes
                let CGST = baseAmount * (chargingSession.charger?.tariff?.CGST / 100);
                CGST = Math.round((CGST + Number.EPSILON) * 100) / 100;
                let SGST = baseAmount * (chargingSession.charger?.tariff?.SGST / 100);
                SGST = Math.round((SGST + Number.EPSILON) * 100) / 100;
                let IGST = baseAmount * (chargingSession.charger?.tariff?.IGST / 100);
                IGST = Math.round((IGST + Number.EPSILON) * 100) / 100;

                // Convert NaN to 0 if tariff fields are null
                if (isNaN(CGST)) CGST = 0;
                if (isNaN(SGST)) SGST = 0;
                if (isNaN(IGST)) IGST = 0;

                // Total Amount = Base Amount + Taxes
                let netAmount = baseAmount + CGST + SGST + IGST;
                netAmount = Math.round((netAmount + Number.EPSILON) * 100) / 100;

                const netAmountString = toAmountString(netAmount);

                // Post Transaction to Ledger
                let systemWallet = await Wallet.findOneByOrFail({code: `SYSTEM:CPO_REVENUE`});
                const userWallet = await Wallet.findOneByOrFail({code: `USER:${chargingSession.user?.id}`});

                const transaction = await LedgerService.postBalancedTransaction({
                    externalRef: `ChargingSession:${sessionId}`,
                    category: TxnCategory.CHARGE,
                    description: `Money is being deducted for Charging Session: ${chargingSession.id}`,
                    legs: [
                        {wallet: systemWallet, type: EntryType.CREDIT, amount: netAmountString, memo: 'CPO Revenue'},
                        {
                            wallet: userWallet,
                            type: EntryType.DEBIT,
                            amount: netAmountString,
                            memo: 'User Vehicle Charge'
                        }
                    ]
                });

                chargingSession.transaction = transaction;
                chargingSession.baseAmount = toAmountString(baseAmount);
                chargingSession.taxAmount = toAmountString(netAmount - baseAmount);
                chargingSession.totalAmount = transaction.amount;
                await chargingSession.save();

                parentPort?.postMessage(`Processed session_completion for session ID ${sessionId}`);
            } catch (error) {
                parentPort?.postMessage(`Error processing session_completion for ${message.key} message: ${error}`);
                // TODO: Implement retry logic or move message to a dead-letter queue
            }
            break;
        }
        default: {
            parentPort?.postMessage(`No handler for topic ${topic}`);
        }
    }
}

export {
    sessionMessageProcessor,
}