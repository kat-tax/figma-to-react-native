export interface ThemePickerForm {
  color: ThemeColor,
  radius: ThemeRadius,
}

export type ThemeRadius =
  | 0
  | 0.3
  | 0.5
  | 0.75
  | 1.0;

export type ThemeColor =
  | 'zinc'
  | 'slate'
  | 'stone'
  | 'gray'
  | 'neutral'
  | 'red'
  | 'rose'
  | 'orange'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'violet';

export interface ThemePreset {
  colors: Record<string, RGB>,
  modes: {
    dark: ThemePresetTokens,
    light: ThemePresetTokens,
  }
}

export interface ThemePresetTokens {
  background: string,
  foreground: string,
  card: string,
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
  cardForeground: string,
}
