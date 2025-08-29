import crypto from 'crypto';

function generateRandomNumber(length: number): string {
    const digits = '0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        randomString += digits[randomIndex];
    }
    return randomString;
}