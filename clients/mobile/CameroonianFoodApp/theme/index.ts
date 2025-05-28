import { createTheme, createBox, createText } from '@shopify/restyle';

const palette = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  black: '#0B0B0B',
  white: '#F0F2F3',
  gray: '#9B9B9B',
  error: '#FF0D10',
  success: '#4CD964',
  warning: '#FFD700',
};

const theme = createTheme({
  colors: {
    mainBackground: palette.white,
    mainForeground: palette.black,
    primary: palette.primary,
    secondary: palette.secondary,
    text: palette.black,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    background: palette.white,
    cardBackground: palette.white,
    buttonPrimary: palette.primary,
    buttonSecondary: palette.secondary,
    gray: palette.gray,
    white: palette.white,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  textVariants: {
    header: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    subheader: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
      color: 'gray',
    },
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
});

export type Theme = typeof theme;
export const Box = createBox<Theme>();
export const Text = createText<Theme>();
export { theme };
