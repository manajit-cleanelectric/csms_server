import firebase from "./../database/firebase";
import {FcmTokens} from "../models/fcmToken.model";

export interface NotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
}

export async function sendPushNotification(
    userId: string,
    payload: NotificationPayload,
    data?: { [key: string]: string }
) {
    const fcmTokens = await FcmTokens.find({
        relations: ['user'],
        where: {
            user: { id: userId },
        },
        select: ["token"]
    });

    if (fcmTokens.length === 0) {
        console.log('No FCM tokens found for user:', userId);
        return;
    }
    const deviceTokens = fcmTokens.map((fcmToken) => fcmToken.token);
    const message = {
        tokens: deviceTokens,
        notification: {
            title: payload.title,
            body: payload.body,
            imageUrl: payload.imageUrl,
        },
        data: data || {},
    };

    try {
        const response = await firebase.messaging().sendEachForMulticast(message);
        console.log(`✅ Successfully sent messages: ${response.successCount}`);
        console.log(`❌ Failed messages: ${response.failureCount}`);

        for (const resp of response.responses) {
            const idx: any = response.responses.indexOf(resp);
            if (!resp.success) {
                console.error(
                    // `Failed to send to token: ${message[idx].token}`,
                    resp.error
                );
                let failedToken = deviceTokens[idx]
                try {
                    await FcmTokens.delete({token: failedToken});
                } catch (error: any) {
                    console.error(error.message);
                }

            }
        }

        return response;
    } catch (error) {
        console.error('❌ Error sending messages:', error);
        throw error;
    }
}