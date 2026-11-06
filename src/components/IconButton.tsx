import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, shadow } from '@/theme';

export interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
}

export function IconButton({ icon: Icon, onPress, accessibilityLabel }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
    >
      <Icon size={22} strokeWidth={2} color={colors.tinta} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blanco, alignItems: 'center', justifyContent: 'center', ...shadow.card },
});
