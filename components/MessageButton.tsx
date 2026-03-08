import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

type Props = {
  label: string;
  emoji: string;
  onPress: () => Promise<void>;
  disabled?: boolean;
  style?: ViewStyle;
};

export function MessageButton({ label, emoji, onPress, disabled, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = React.useState(false);

  const handlePress = async () => {
    if (loading || disabled) return;

    // Animate press
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#C4607A" size="small" />
        ) : (
          <Text style={styles.label}>
            {emoji}{'  '}{label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: '#F4A0B5',
    alignItems: 'center',
    shadowColor: '#F4A0B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#7A2A3A',
    letterSpacing: 0.2,
  },
});
