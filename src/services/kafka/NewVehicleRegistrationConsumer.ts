import {kafkaClients} from './kafkaClients';
import {sendMail} from "../mail.services";
import {logger} from "../../app";

const notificationServiceConsumer = kafkaClients.consumer({groupId: 'notification-service-group'});

export const startConsumer = async () => {
    await notificationServiceConsumer.connect();
    await notificationServiceConsumer.subscribe({topic: 'email-notification', fromBeginning: false});

    await notificationServiceConsumer.run({
        eachMessage: async ({message}) => {
            logger.info(`A new message has arrived in Email Notification`);
            let body = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: auto;">
    <p style="margin-bottom: 20px;">Dear <strong>Admin</strong>,</p>
    <p style="margin-bottom: 25px;">
        A new vehicle has been <strong style="color: #007BFF;">registered</strong> by a user and is
        <strong style="color: #DC3545;">pending your approval</strong>.
    </p>
    <h3 style="color: #444; margin-bottom: 15px;">📄 Registration Details:</h3>
    <table cellpadding="10" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%; font-size: 15px; border-color: #ddd;">
        <tr style="background-color: #f9f9f9;">
            <th align="left" style="padding: 12px;">Field</th>
            <th align="left" style="padding: 12px;">Value</th>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Name</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">John Doe</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Email</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">john.doe@example.com</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Vehicle Make & Model</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">Tesla Model 3</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>License Plate</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">ABC-1234</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Registration Date</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">August 28, 2025</td>
        </tr>
    </table>
    <p style="margin-top: 30px; font-size: 16px;">
        Please <strong style="color: #28A745;">log in to the admin dashboard</strong> to review and approve this registration.
    </p>
    <p style="margin-top: 40px; font-size: 16px;">
        Thank you,<br />
        <em>Your App Name</em>
    </p>
</div>`
            sendMail("kumar.ranvijay@cleanelectric.in", "kumar.ranvijay@cleanelectric.in", "🚗 New Vehicle Registration Requires Approval", body)
            // const value = message.value?.toString();
            // if (value) {
            //     const session = JSON.parse(value);
            //     console.log('🔔 Charging session completed:', session);
            //     // Handle wallet deduction or DB logic here
            // }
        },
    });
};