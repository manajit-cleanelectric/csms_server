import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

// Create a transporter object using SMTP transport
const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kumar.ranvijay@cleanelectric.in',           // Replace with your email
        pass: 'nezhcetiujbfejtb' // Replace with your app password
    }
});

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
            console.error('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}