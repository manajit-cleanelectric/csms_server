import {EachMessageHandler, EachMessagePayload} from "kafkajs";
import {sendMail} from "../../services/mail.service";
import {parentPort} from "worker_threads";
import {
    emailVerificationMailBodyInterface,
    topUpSuccessfulMailBodyInterface,
    vehicleRegistrationMailBodyInterface
} from "../../utils/mailBodyInterface";
import {Users} from "../../models/user.model";
import jwt from "jsonwebtoken";

/**
 * Processes user-related Kafka messages and triggers appropriate email notifications.
 * @param {EachMessagePayload} payload - The message payload from Kafka.
 * @returns {Promise<void>} A promise that resolves when the message has been processed.
 */
const userMessageProcessor: EachMessageHandler = async (payload: EachMessagePayload): Promise<void> => {
    const {topic, partition, message, heartbeat, pause} = payload;
    parentPort?.postMessage(`Received message on topic ${topic}, partition ${partition}`);
    switch (topic) {
        case ('new_vehicle_registration'): {
            const {key, value} = message;
            const phoneNo = key?.toString()!;
            const vehicleData = JSON.parse(value?.toString()!)
            const {userName, email, vehicleCompanyAndModel, rcNumber, timeStamp} = vehicleData;
            const body = vehicleRegistrationMailBodyInterface(userName, phoneNo, email, vehicleCompanyAndModel, rcNumber, timeStamp);
            sendMail('clean@gmail.com', 'achyut.software@gmail.com', '🚗 New Vehicle Registration Requires Approval', body)
            break;
        }
        case ('email_verification'): {
            const {key, value} = message;
            const phoneNo = key?.toString()!;
            const emailData = JSON.parse(value?.toString()!)
            const {email} = emailData;
            const user = await Users.findOneOrFail({
                where: {phoneNumber: phoneNo}
            });
            const token = jwt.sign({ phoneNo, email }, process.env.JWT_SECRET_KEY!, { expiresIn: '24h' });
            const verificationLink = `http://${process.env.SERVER_URL}/users/verify-email?token=${token}`;
            const body = emailVerificationMailBodyInterface(user.firstName, verificationLink);
            sendMail('clean@gmail.com', email, '📧 Verify Your Email Address', body);
            break;
        }
        case ('top_up_mail'): {
            const {key, value} = message;
            const phoneNo = key?.toString()!;
            const topUpData = JSON.parse(value?.toString()!)
            const {amount, orderId, timeStamp} = topUpData;
            const user = await Users.findOneOrFail({
                where: {phoneNumber: phoneNo}
            });
            if (user.isEmailVerified) {
                const body = topUpSuccessfulMailBodyInterface(user.firstName, amount, orderId, timeStamp);
                sendMail('clean@gmail.com', user.email!, '💰 Wallet Top-Up Successful', body);
            }
            break;
        }
        default: {
            parentPort?.postMessage(`No handler for topic ${topic}`);
        }
    }
}

export {
    userMessageProcessor,
}