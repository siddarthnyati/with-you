import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';

import { MessageButton } from '../../components/MessageButton';
import { getMyName, getPartnerName } from '../../lib/storage';
import {
  registerForPushNotificationsAsync,
  upsertUserToken,
  sendNotification,
} from '../../lib/notifications';

const MESSAGES = [
  { label: 'Drink water', emoji: '💧' },
  { label: 'Thinking of you', emoji: '💭' },
  { label: 'Missing you', emoji: '🥺' },
  { label: "You're doing amazing", emoji: '✨' },
  { label: 'Rest if you can', emoji: '🌙' },
  { label: 'I love you', emoji: '❤️' },
];

export default function HomeScreen() {
  const [myName, setMyName] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [sentLabel, setSentLabel] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load names whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadNames();
    }, [])
  );

  async function loadNames() {
    const [me, partner] = await Promise.all([getMyName(), getPartnerName()]);
    setMyName(me);
    setPartnerName(partner);

    // Register push token if we have a name
    if (me) {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) await upsertUserToken(me, token);
      } catch (e) {
        console.warn('Push registration failed:', e);
      }
    }
  }

  function showSentFeedback(label: string) {
    setSentLabel(label);
    fadeAnim.setValue(1);
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => setSentLabel(null));
  }

  async function handleSend(message: string) {
    if (!myName || !partnerName) {
      Alert.alert(
        'Setup needed',
        'Go to Settings to set your name and your partner\'s name first.'
      );
      return;
    }

    try {
      await sendNotification(partnerName, message, myName);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSentFeedback(message);
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Could not send', err.message ?? 'Something went wrong. Try again.');
    }
  }

  const isReady = !!myName && !!partnerName;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {!isReady && (
          <View style={styles.setupBanner}>
            <Text style={styles.setupText}>
              Go to Settings to set your names before sending 💕
            </Text>
          </View>
        )}

        <View style={styles.buttons}>
          {MESSAGES.map(({ label, emoji }) => (
            <MessageButton
              key={label}
              label={label}
              emoji={emoji}
              onPress={() => handleSend(label)}
              disabled={!isReady}
            />
          ))}
        </View>

        {/* Sent confirmation toast */}
        {sentLabel && (
          <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
            <Text style={styles.toastText}>Sent to {partnerName} 💕</Text>
          </Animated.View>
        )}

        <View style={styles.footer}>
          {myName && partnerName ? (
            <Text style={styles.footerText}>
              {myName} → {partnerName}
            </Text>
          ) : (
            <Text style={styles.footerTextMuted}>Not set up yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  setupBanner: {
    backgroundColor: '#FFF0C0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0D060',
  },
  setupText: {
    color: '#7A6000',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttons: {
    flex: 1,
  },
  toast: {
    backgroundColor: '#C4607A',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: '#C4607A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F4D0D8',
  },
  footerText: {
    color: '#C4607A',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerTextMuted: {
    color: '#C4A8B0',
    fontSize: 14,
  },
});
