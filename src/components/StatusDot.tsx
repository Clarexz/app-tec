import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, shadow } from '@/theme';

export function StatusDot({ ok }: { ok: boolean | null }) {
  const bg = ok === null ? colors.tintaSuave : ok ? colors.hoja : colors.error;
  const label = ok === null ? 'Comprobando' : ok ? 'En línea' : 'Sin conexión';
  return <View accessibilityRole="image" accessibilityLabel={label} style={[styles.dot, { backgroundColor: bg }]} />;
}

const styles = StyleSheet.create({
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.blanco, ...shadow.card },
});
