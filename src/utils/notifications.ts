import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// NOTIFICATION SETUP
// ============================================

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions and get Expo Push Token.
 * Saves the token to Firestore under pushTokens/{uid}
 */
export async function registerForPushNotifications(uid: string): Promise<string | null> {
    try {
        // Request permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Push notification permission not granted');
            return null;
        }

        // Get Expo Push Token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId ?? undefined,
        });
        const token = tokenData.data;

        // Save token to Firestore
        await setDoc(doc(db, 'pushTokens', uid), {
            token,
            uid,
            platform: Platform.OS,
            updatedAt: Date.now(),
        });

        // Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Varsayılan',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#00D9A6',
            });
        }

        console.log('Push token registered:', token);
        return token;
    } catch (error) {
        console.warn('Push notification registration error:', error);
        return null;
    }
}

/**
 * Fetch all push tokens from Firestore and send notification via Expo Push API.
 * This sends to ALL registered users (broadcast).
 */
export async function sendPushToAllUsers(title: string, body: string): Promise<{ success: number; failed: number }> {
    try {
        // Get all tokens from Firestore
        const tokensSnap = await getDocs(collection(db, 'pushTokens'));
        const tokens: string[] = [];

        tokensSnap.docs.forEach(d => {
            const data = d.data();
            if (data.token) {
                tokens.push(data.token);
            }
        });

        if (tokens.length === 0) {
            return { success: 0, failed: 0 };
        }

        // Build Expo push messages
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default' as const,
            title,
            body,
            data: { type: 'admin_broadcast' },
        }));

        // Send via Expo Push API (batch)
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        const result = await response.json();

        let success = 0;
        let failed = 0;

        if (Array.isArray(result.data)) {
            result.data.forEach((r: any, i: number) => {
                if (r.status === 'ok') success++;
                else {
                    failed++;
                    console.warn(`Push failed for token ${tokens[i]}:`, r.message || r.details?.error || r);
                }
            });
        }

        return { success, failed };
    } catch (error) {
        console.warn('Push notification send error:', error);
        return { success: 0, failed: 0 };
    }
}

/**
 * Schedule a local notification (for reminders, limit warnings etc.)
 */
export async function scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number = 1,
): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: 'default' },
        trigger: { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
    });
}
