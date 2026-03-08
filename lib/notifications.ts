import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token: permission not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'With You',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F4A0B5',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function upsertUserToken(name: string, token: string | null): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert(
      { name, expo_push_token: token, updated_at: new Date().toISOString() },
      { onConflict: 'name' }
    );

  if (error) {
    console.error('Error upserting user token:', error.message);
    throw error;
  }
}

export async function sendNotification(
  partnerName: string,
  message: string,
  senderName: string
): Promise<void> {
  // Look up partner's token in Supabase
  const { data, error } = await supabase
    .from('users')
    .select('expo_push_token')
    .eq('name', partnerName)
    .single();

  if (error || !data?.expo_push_token) {
    throw new Error(
      `Could not find ${partnerName}. Make sure they've opened the app and set their name.`
    );
  }

  const token = data.expo_push_token;

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      title: `From ${senderName} 💕`,
      body: message,
      sound: 'default',
      data: { message, sender: senderName },
    }),
  });

  const result = await response.json();

  if (result.data?.status === 'error') {
    throw new Error(result.data.message ?? 'Failed to send notification');
  }
}
