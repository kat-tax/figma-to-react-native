export interface ThemeForm {
  theme: ThemePresets | 'Brand',
  color: RGBA,
  scale: ThemeScale,
  radius: ThemeRadius,
}

export type ThemeScale = {
  50: string,
  100: string,
  200: string,
  300: string,
  400: string,
  500: string,
  600: string,
  700: string,
  800: string,
  900: string,
}

export type ThemeRadius =
  | '0'
  | '0.3'
  | '0.5'
  | '0.75'
  | '1.0';

export type ThemePresets =
  | 'Zinc'
  | 'Slate'
  | 'Stone'
  | 'Grey'
  | 'Neutral'
  | 'Red'
  | 'Rose'
  | 'Orange'
  | 'Green'
  | 'Blue'
  | 'Yellow'
  | 'Violet';

export interface ThemeTokens {
  colors: Record<string, RGB>,
  modes: {
    dark: ThemeTokenValues,
    light: ThemeTokenValues,
  }
}

export interface ThemeTokenValues {
  background: string,
  foreground: string,
  card: string,
  cardForeground: string,
  popover: string,
  popoverForeground: string,
  primary: string,
  primaryForeground: string,
  secondary: string,
  secondaryForeground: string,
  muted: string,
  mutedForeground: string,
  accent: string,
  accentForeground: string,
  destructive: string,
  destructiveForeground: string,
  border: string,
  input: string,
  ring: string,
}
