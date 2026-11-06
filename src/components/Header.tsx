import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

export interface HeaderProps {
  kicker?: string;
  title: string;
  right?: ReactNode;
  onLongPressTitle?: () => void;
}

export function Header({ kicker, title, right, onLongPressTitle }: HeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.left} onLongPress={onLongPressTitle} delayLongPress={600} accessibilityRole="header">
        {kicker ? <Text variant="kicker">{kicker}</Text> : null}
        <Text variant="display">{title}</Text>
      </Pressable>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  left: { flex: 1, gap: 4 },
  right: { paddingBottom: 2 },
});
