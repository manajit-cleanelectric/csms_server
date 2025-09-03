import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import {parentPort} from "worker_threads";

/**
 * Mail transporter configuration using Gmail SMTP
 */
const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ACCOUNT_ID,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});


/**
 * Send an email
 * @param from - sender email address
 * @param to - recipient email address
 * @param subject - email subject
 * @param message - email body in HTML format
 * @returns void - sends email and logs result to parent port
 */
export function sendMail(from: string, to: string, subject: string, message: string) {
    // Define mail options
    const mailOptions: SendMailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: message,
    };
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            parentPort?.postMessage(`Error: ${error}`);
        } else {
            parentPort?.postMessage(`Email sent: ${info.response}`);
        }
    });
}