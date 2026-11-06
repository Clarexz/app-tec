import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { text, type TextVariant } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}

export function Text({ variant = 'body', color, center, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[text[variant], color ? { color } : null, center ? { textAlign: 'center' } : null, style]}
    />
  );
}
