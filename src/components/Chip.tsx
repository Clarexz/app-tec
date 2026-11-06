import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  tone?: 'sol' | 'hueso' | 'rosa';
  size?: 'md' | 'lg';
}

export function Chip({ label, tone = 'sol', size = 'md' }: ChipProps) {
  const lg = size === 'lg';
  const bg = tone === 'sol' ? colors.sol : tone === 'hueso' ? colors.hueso : colors.rosa;
  const fg = tone === 'rosa' ? colors.marfil : colors.tinta;
  return (
    <View style={[styles.base, { backgroundColor: bg, paddingHorizontal: lg ? 16 : 10, height: lg ? 44 : 28 }]}>
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
  base: { alignSelf: 'flex-start', borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
