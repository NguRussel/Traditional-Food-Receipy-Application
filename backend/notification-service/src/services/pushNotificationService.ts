import firebaseAdmin from '../config/firebaseAdmin';
import { PushSubscription } from '../models/PushSubscription';
import { INotification } from '../models/Notification'; // To use for payload structure

interface PushMessagePayload {
    notification: {
        title: string;
        body: string;
    };
    data?: { [key: string]: string }; // Optional data payload
    // Common APNS/Android/Webpush options can be added here if needed
}

/**
 * Sends a push notification to a single device token.
 * @param token The FCM device token.
 * @param title The title of the notification.
 * @param body The body/message of the notification.
 * @param data Optional data payload to send with the notification.
 */
export const sendPushNotificationToToken = async (
    token: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
): Promise<boolean> => {
    if (!firebaseAdmin.apps.length) { // Check if Firebase Admin is initialized
        console.warn('Firebase Admin SDK not initialized. Cannot send push notification.');
        return false;
    }

    const message: PushMessagePayload = {
        notification: {
            title,
            body,
        },
    };
    if (data) {
        message.data = data;
    }

    try {
        console.log(`Attempting to send push notification to token: ${token}`);
        await firebaseAdmin.messaging().send({ token, ...message });
        console.log(`Successfully sent push notification to token: ${token}`);
        return true;
    } catch (error: any) {
        console.error(`Error sending push notification to token ${token}:`, error.message);
        // Handle specific error codes from FCM, e.g., unregistering invalid tokens
        if (error.code === 'messaging/registration-token-not-registered' || 
            error.code === 'messaging/invalid-registration-token') {
            console.log(`Token ${token} is invalid or unregistered. Deactivating subscription.`);
            await PushSubscription.findOneAndUpdate({ token }, { isActive: false });
        }
        return false;
    }
};

/**
 * Sends a push notification to all active devices/tokens for a given user.
 * @param userId The ID of the user to send notifications to.
 * @param notificationDoc The notification document containing title, message, data.
 */
export const sendPushNotificationToUser = async (
    userId: string,
    notificationDoc: INotification
): Promise<void> => {
    if (!firebaseAdmin.apps.length) {
        console.warn('Firebase Admin SDK not initialized. Cannot send push notifications to user.');
        return;
    }

    const subscriptions = await PushSubscription.find({ userId, isActive: true });

    if (subscriptions.length === 0) {
        console.log(`No active push subscriptions found for user ${userId}.`);
        return;
    }

    console.log(`Found ${subscriptions.length} active subscription(s) for user ${userId}.`);

    const { title, message, data } = notificationDoc;
    const notificationData = data ? JSON.parse(JSON.stringify(data)) : undefined;

    const results = await Promise.allSettled(
        subscriptions.map(sub => 
            sendPushNotificationToToken(sub.token, title, message, notificationData)
        )
    );

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            console.log(`Successfully sent notification to token: ${subscriptions[index].token}`);
        } else if (result.status === 'fulfilled' && !result.value) {
            console.log(`Failed to send notification to token (handled by sendPushNotificationToToken): ${subscriptions[index].token}`);
        } else if (result.status === 'rejected') {
            console.error(`Unexpected error sending notification to token ${subscriptions[index].token}:`, result.reason);
        }
    });
};

export const sendPushNotificationToTopic = async (
    topic: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
): Promise<boolean> => {
    if (!firebaseAdmin.apps.length) {
        console.warn('Firebase Admin SDK not initialized. Cannot send push notification to topic.');
        return false;
    }

    const message: PushMessagePayload = {
        notification: {
            title,
            body,
        },
    };
    if (data) {
        message.data = data;
    }

    try {
        console.log(`Attempting to send push notification to topic: ${topic}`);
        // Prepend /topics/ if not already present, as required by FCM
        const fcmTopic = topic.startsWith('/topics/') ? topic : `/topics/${topic}`;
        await firebaseAdmin.messaging().send({ topic: fcmTopic, ...message });
        console.log(`Successfully sent push notification to topic: ${fcmTopic}`);
        return true;
    } catch (error: any) {
        console.error(`Error sending push notification to topic ${topic}:`, error.message);
        // TODO: Handle specific errors for topics, e.g., if the topic doesn't exist
        // or if there are issues with the message payload for topics.
        return false;
    }
};

// TODO: Add functions for sending to topics if needed
// export const sendPushNotificationToTopic = async (topic: string, title: string, body: string, data?: any) => { ... } 