import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const Base_Url =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://traveazi.onrender.com/api';

// Android channel. Without an explicit channel, Android 8+ silently drops
// the notification and the send looks like it worked.
const ANDROID_CHANNEL_ID = 'rides';

let handlerConfigured = false;

/**
 * Show the push as an alert while the app is OPEN.
 *
 * Without this handler, a notification delivered while the user is looking at
 * the app is discarded — the system only auto-displays it when the app is
 * backgrounded. Safe to call more than once.
 */
export function configureForegroundHandler(): void {
  if (handlerConfigured) return;
  handlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Ride updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#245AB0',
  });
}

async function apiCall(
  path: string,
  method: 'POST' | 'DELETE',
  deviceToken: string,
  authToken: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${Base_Url}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceToken }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Upload the FCM token for the current session.
 *
 * IMPORTANT: this uses getDevicePushTokenAsync (raw FCM token) and NOT
 * getExpoPushTokenAsync. The backend sends with firebase-admin, which cannot
 * deliver to an `ExponentPushToken[...]`. Registering the Expo token makes
 * every send fail silently.
 *
 * Never throws — a failed push registration must not break login.
 */
export async function syncPushRegistration(authToken: string): Promise<boolean> {
  try {
    // Simulators and most emulators report isDevice === false and never
    // receive a push, so there is no point registering.
    if (!Device.isDevice) return false;
    if (!authToken) return false;

    await ensureAndroidChannel();

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;

    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') return false;

    const data = await Notifications.getDevicePushTokenAsync();
    const deviceToken = data.data;
    if (!deviceToken) return false;

    return await apiCall('/user/devices/register', 'POST', deviceToken, authToken);
  } catch {
    return false;
  }
}

/**
 * Remove this device's token on logout, otherwise the next person to log in on
 * the same phone keeps receiving the previous user's ride requests.
 */
export async function removePushRegistration(authToken: string): Promise<boolean> {
  try {
    if (!Device.isDevice || !authToken) return false;

    const data = await Notifications.getDevicePushTokenAsync();
    const deviceToken = data.data;
    if (!deviceToken) return false;

    return await apiCall('/user/devices/unregister', 'DELETE', deviceToken, authToken);
  } catch {
    return false;
  }
}
