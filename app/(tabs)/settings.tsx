import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { getMyName, getPartnerName, setMyName, setPartnerName } from '../../lib/storage';
import {
  registerForPushNotificationsAsync,
  upsertUserToken,
} from '../../lib/notifications';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const [myName, setMyNameState] = useState('');
  const [partnerName, setPartnerNameState] = useState('');
  const [saving, setSaving] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState<boolean | null>(null);
  const [checkingPartner, setCheckingPartner] = useState(false);

  useEffect(() => {
    loadNames();
  }, []);

  async function loadNames() {
    const [me, partner] = await Promise.all([getMyName(), getPartnerName()]);
    if (me) setMyNameState(me);
    if (partner) setPartnerNameState(partner);
  }

  async function checkPartnerStatus(name: string) {
    if (!name.trim()) return;
    setCheckingPartner(true);
    try {
      const { data } = await supabase
        .from('users')
        .select('expo_push_token, updated_at')
        .eq('name', name.trim())
        .single();

      setPartnerOnline(!!data?.expo_push_token);
    } catch {
      setPartnerOnline(null);
    } finally {
      setCheckingPartner(false);
    }
  }

  async function handleSave() {
    const trimmedMe = myName.trim();
    const trimmedPartner = partnerName.trim();

    if (!trimmedMe || !trimmedPartner) {
      Alert.alert('Both names required', 'Please fill in both your name and your partner\'s name.');
      return;
    }

    if (trimmedMe.toLowerCase() === trimmedPartner.toLowerCase()) {
      Alert.alert('Different names needed', 'Your name and your partner\'s name must be different.');
      return;
    }

    setSaving(true);
    try {
      // Save names locally
      await Promise.all([setMyName(trimmedMe), setPartnerName(trimmedPartner)]);

      // Register push token and upsert to Supabase
      const token = await registerForPushNotificationsAsync();
      await upsertUserToken(trimmedMe, token);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved!', `You're set up as "${trimmedMe}". Notifications will be sent to "${trimmedPartner}".`);

      // Check if partner exists
      checkPartnerStatus(trimmedPartner);
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error saving', err.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your name</Text>
            <Text style={styles.hint}>This is how your partner sees who sent the message.</Text>
            <TextInput
              style={styles.input}
              value={myName}
              onChangeText={setMyNameState}
              placeholder="e.g. Sid"
              placeholderTextColor="#C4A8B0"
              autoCapitalize="words"
              returnKeyType="next"
              maxLength={30}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Partner's name</Text>
            <Text style={styles.hint}>Must match exactly what they set as their name in the app.</Text>
            <TextInput
              style={styles.input}
              value={partnerName}
              onChangeText={setPartnerNameState}
              placeholder="e.g. Priya"
              placeholderTextColor="#C4A8B0"
              autoCapitalize="words"
              returnKeyType="done"
              maxLength={30}
              onBlur={() => checkPartnerStatus(partnerName)}
            />

            {checkingPartner && (
              <View style={styles.partnerStatus}>
                <ActivityIndicator size="small" color="#C4607A" />
                <Text style={styles.partnerStatusText}>Checking...</Text>
              </View>
            )}

            {!checkingPartner && partnerOnline !== null && (
              <View style={styles.partnerStatus}>
                <Text style={[styles.dot, partnerOnline ? styles.dotGreen : styles.dotOrange]}>
                  ●
                </Text>
                <Text style={styles.partnerStatusText}>
                  {partnerOnline
                    ? `${partnerName} is set up and ready`
                    : `${partnerName} hasn't opened the app yet`}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save & register 💕</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              1. Both of you open the app in Expo Go{'\n'}
              2. Each person goes to Settings and sets their name{'\n'}
              3. Set your partner's name to match their name exactly{'\n'}
              4. Grant notification permissions when asked{'\n'}
              5. Go to the main screen and tap any message to send it!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F4D0D8',
    shadowColor: '#F4A0B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7A2A3A',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#B08090',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#F4A0B5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#3A1520',
    backgroundColor: '#FFF8FA',
  },
  partnerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  partnerStatusText: {
    fontSize: 13,
    color: '#7A4050',
  },
  dot: {
    fontSize: 12,
  },
  dotGreen: {
    color: '#4CAF50',
  },
  dotOrange: {
    color: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#C4607A',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#C4607A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F4D0D8',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7A2A3A',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#5A3040',
    lineHeight: 22,
  },
});
