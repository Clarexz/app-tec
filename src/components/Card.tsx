import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, layout, radius, shadow } from '@/theme';

export interface CardProps {
  variant?: 'default' | 'secondary' | 'highlight';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  accessibilityLabel?: string;
}

export function Card({ variant = 'default', onPress, style, children, accessibilityLabel }: CardProps) {
  const base = [
    styles.base,
    variant === 'secondary'
      ? { backgroundColor: colors.hueso }
      : variant === 'highlight'
        ? { backgroundColor: colors.rosa, ...shadow.card }
        : { backgroundColor: colors.blanco, ...shadow.card },
  ];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { opacity: 0.88 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { padding: layout.cardPadding, borderRadius: radius.lg },
});
