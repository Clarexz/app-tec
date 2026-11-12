import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fonts, radius } from '@/theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  tone?: 'sol' | 'hueso' | 'rosa' | 'hoja';
  size?: 'md' | 'lg';
  /** Ícono Lucide opcional antes del texto. */
  icon?: LucideIcon;
  accessibilityLabel?: string;
}

export function Chip({ label, tone = 'sol', size = 'md', icon: Icon, accessibilityLabel }: ChipProps) {
  const lg = size === 'lg';
  const bg =
    tone === 'sol' ? colors.sol : tone === 'hueso' ? colors.hueso : tone === 'hoja' ? colors.hoja : colors.rosa;
  const fg = tone === 'rosa' ? colors.marfil : tone === 'hoja' ? colors.blanco : colors.tinta;
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, { backgroundColor: bg, paddingHorizontal: lg ? 16 : 10, height: lg ? 44 : 28 }]}
    >
      {Icon ? <Icon size={lg ? 20 : 16} strokeWidth={2} color={fg} /> : null}
      <Text
        style={{
          fontFamily: lg ? fonts.displayExtraBold : fonts.sansBold,
          fontSize: lg ? 22 : 14,
          lineHeight: lg ? 28 : 20,
          color: fg,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
