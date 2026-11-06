export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48 } as const;
export const radius = { sm: 6, md: 12, lg: 22, bubble: 26, pill: 999 } as const;
export const shadow = {
  card: {
    shadowColor: '#141414',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;
/** Margen lateral de pantalla y separación entre tarjetas */
export const layout = { gutter: 20, cardGap: 12, cardPadding: 18 } as const;
