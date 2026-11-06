import type { TextStyle } from 'react-native';
import { colors } from './colors';

/** Nombres de familia registrados en useFonts (app/_layout.tsx). En Android cada peso es una familia. */
export const fonts = {
  displayBold: 'FunnelDisplay_700Bold',
  displayExtraBold: 'FunnelDisplay_800ExtraBold',
  sansRegular: 'FunnelSans_400Regular',
  sansMedium: 'FunnelSans_500Medium',
  sansBold: 'FunnelSans_700Bold',
  caveatBold: 'Caveat_700Bold',
} as const;

export const text = {
  display: { fontFamily: fonts.displayExtraBold, fontSize: 32, lineHeight: 34, letterSpacing: -1, color: colors.tinta },
  h2: { fontFamily: fonts.displayExtraBold, fontSize: 24, lineHeight: 28, color: colors.tinta },
  h3: { fontFamily: fonts.displayBold, fontSize: 18, lineHeight: 22, color: colors.tinta },
  body: { fontFamily: fonts.sansRegular, fontSize: 16, lineHeight: 24, color: colors.tinta },
  bodyStrong: { fontFamily: fonts.sansBold, fontSize: 16, lineHeight: 22, color: colors.tinta },
  small: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.tintaSuave },
  kicker: { fontFamily: fonts.sansBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.rosaProfundo },
  annotation: { fontFamily: fonts.caveatBold, fontSize: 24, lineHeight: 26, color: colors.rosaProfundo },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof text;
