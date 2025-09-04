import {EachMessageHandler, EachMessagePayload} from "kafkajs";
import {sendMail} from "../../services/mail.service";
import {parentPort} from "worker_threads";

function mailBodyInterface(
    userName: string,
    phoneNo: string,
    email: string | undefined,
    vehicleCompanyAndModel: string,
    rcNumber: string,
    timeStamp: string
): string {
    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: auto;">
    <p style="margin-bottom: 20px;">Dear <strong>Admin</strong>,</p>
    <p style="margin-bottom: 25px;">
        A new vehicle has been <strong style="color: #007BFF;">registered</strong> by a user and is
        <strong style="color: #DC3545;">pending your approval</strong>.
    </p>
    <h3 style="color: #444; margin-bottom: 15px;">📄 Registration Details:</h3>
    <table style="border-collapse: collapse; width: 100%; font-size: 15px; border-color: #ddd;">
        <tr style="background-color: #f9f9f9;">
            <th style="padding: 12px;">Field</th>
            <th style="padding: 12px;">Value</th>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Name</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${userName}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Email</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${email ?? 'N/A'}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Phone</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${phoneNo}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Vehicle Make & Model</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${vehicleCompanyAndModel}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>License Plate</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${rcNumber}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Registration Date</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${timeStamp}</td>
        </tr>
    </table>
    <p style="margin-top: 30px; font-size: 16px;">
        Please <strong style="color: #28A745;">log in to the admin dashboard</strong> to review and approve this registration.
    </p>
    <p style="margin-top: 40px; font-size: 16px;">
        Thank you,<br />
        <em>Clean Charge</em>
    </p>
</div>`;
}

const vehicleMessageProcessor: EachMessageHandler = async (payload: EachMessagePayload): Promise<void> => {
    const {topic, partition, message, heartbeat, pause} = payload;
    parentPort?.postMessage(`Received message on topic ${topic}, partition ${partition}`);
    switch (topic) {
        case ('new_vehicle_registration'): {
            const {key, value} = message;
            const vehicleData = JSON.parse(value?.toString()!)
            const {userName, phoneNo, email, vehicleCompanyAndModel, rcNumber, timeStamp} = vehicleData;
            const body = mailBodyInterface(userName, phoneNo, email, vehicleCompanyAndModel, rcNumber, timeStamp);
            sendMail('clean@gmail.com', 'achyut.software@gmail.com', '🚗 New Vehicle Registration Requires Approval', body)
            break;
        }
        default: {
            parentPort?.postMessage(`No handler for topic ${topic}`);
        }
    }
}

export {
    vehicleMessageProcessor,
}