import React, { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  hint?: string;
  right?: ReactNode;
  inputRef?: React.ComponentProps<typeof TextInput>['ref'];
}

export function TextField({ label, error, hint, right, inputRef, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.rosaProfundo : colors.borde;
  return (
    <View style={styles.wrap}>
      <Text variant="small" color={colors.tinta} style={styles.label}>{label}</Text>
      <View style={[styles.row, { borderColor }]}>
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          placeholderTextColor={colors.tintaSuave}
          selectionColor={colors.rosa}
          {...rest}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={styles.input}
        />
        {right}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : hint ? (
        <Text variant="small" style={styles.msg}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: fonts.sansBold },
  row: {
    height: 52, borderRadius: radius.md, backgroundColor: colors.blanco, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8,
  },
  input: { flex: 1, height: '100%', fontFamily: fonts.sansRegular, fontSize: 16, color: colors.tinta, padding: 0 },
  error: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.error },
  msg: { marginTop: 0 },
});
