import React from 'react';
import { StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';
import { Text } from './Text';

export function Footer() {
  return (
    <Text variant="small" center style={styles.t}>
      Hecho por <Text variant="small" color={colors.tinta} style={{ fontFamily: fonts.sansBold }}>Ravyn Studio</Text>
    </Text>
  );
}

const styles = StyleSheet.create({ t: { marginVertical: 24 } });
