import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Text } from './Text';

export interface BannerProps {
  tone: 'error' | 'success' | 'info';
  title: string;
  message?: string;
  detail?: string;
  onClose?: () => void;
}

export function Banner({ tone, title, message, detail, onClose }: BannerProps) {
  const Icon = tone === 'error' ? CircleAlert : tone === 'success' ? CircleCheck : Info;
  const accent = tone === 'error' ? colors.error : tone === 'success' ? colors.hoja : colors.tinta;
  const bg = tone === 'info' ? colors.hueso : colors.blanco;
  const border = tone === 'info' ? colors.hueso : accent;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.box, { backgroundColor: bg, borderColor: border }]}
    >
      <Icon size={22} strokeWidth={2} color={accent} style={styles.icon} />
      <View style={styles.body}>
        <Text variant="bodyStrong">{title}</Text>
        {message ? <Text>{message}</Text> : null}
        {detail ? <Text variant="small">{detail}</Text> : null}
      </View>
      {onClose ? (
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar aviso" hitSlop={10}>
          <X size={20} strokeWidth={2} color={colors.tinta} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1.5 },
  icon: { marginTop: 1 },
  body: { flex: 1, gap: 2 },
});
