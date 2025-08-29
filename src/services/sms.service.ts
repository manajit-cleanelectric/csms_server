import {logger, SMS_SERVICE_PROVIDER_URL, SMS_SERVICE_PROVIDER_API_KEY} from "../app";

async function sendOtp(phoneNumber: string, otp: string) {
    logger.info(`Sending ${otp} to phone number ${phoneNumber}`);
    const otpMessage = `${otp} is your Clean Charge OTP (valid for 5 mins). Do not share it with anyone. \n www.cleanelectric.in`;
    await sendTextSms(phoneNumber, otpMessage);
    return true;
}

async function sendTextSms(phoneNumber: string, message: string) {
    // TODO remove if block once DLT message is implemented as it prevents from sending the message
    if (/^[0-5]/.test(phoneNumber)) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }
    if (!SMS_SERVICE_PROVIDER_URL || !SMS_SERVICE_PROVIDER_API_KEY) {
        return;
    }
    const url: string = SMS_SERVICE_PROVIDER_URL;
    const headers = {
        'authorization': SMS_SERVICE_PROVIDER_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const body = new URLSearchParams({
        message: message,
        language: 'english',
        route: 'q',
        numbers: phoneNumber,
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });
        const data = await response.json();
        logger.info(data);
    } catch (error: any) {
        logger.error('Error sending SMS:', error.message);
    }
}

export {
    sendOtp,
    sendTextSms,
};

