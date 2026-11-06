import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fonts, radius } from '@/theme';
import { Text } from './Text';

export interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  arrow?: boolean;
  haptic?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title, variant = 'primary', onPress, loading, disabled, icon: Icon, iconRight: IconRight,
  arrow, haptic, accessibilityLabel, style,
}: ButtonProps) {
  const off = !!disabled || !!loading;
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? (disabled ? colors.hueso : colors.rosa) : 'transparent';
  const fg = disabled
    ? colors.tintaSuave
    : isPrimary ? colors.marfil : variant === 'secondary' ? colors.tinta : colors.rosaProfundo;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={off}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: disabled ? colors.borde : colors.tinta },
        pressed && !off && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {Icon ? <Icon size={20} strokeWidth={2} color={fg} /> : null}
            <Text style={{ fontFamily: fonts.sansBold, fontSize: 16, lineHeight: 22, color: fg }}>
              {title}{arrow ? ' →' : ''}
            </Text>
            {IconRight ? <IconRight size={20} strokeWidth={2} color={fg} /> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 52, borderRadius: radius.pill, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
