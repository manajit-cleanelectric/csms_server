import {logger} from "../app";

async function sendOtp(phoneNumber: string, otp: string) {
    logger.info(`Sending ${otp} to phone number ${phoneNumber}`);
    await sendTextSms(phoneNumber, otp);
    return true;
}

async function sendTextSms(phoneNumber: string, message: string) {
    return new Promise((resolve, reject) => {
        resolve({});
    })
}

export {
    sendOtp,
    sendTextSms,
};

