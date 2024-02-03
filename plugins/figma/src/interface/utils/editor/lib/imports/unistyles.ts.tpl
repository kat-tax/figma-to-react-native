import {UnistylesRegistry} from 'react-native-unistyles';
export {createStyleSheet, useStyles} from 'react-native-unistyles';
import initialTheme, {themes, breakpoints} from 'theme';

type AppThemes = {[K in keyof typeof themes]: typeof themes[K]};
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

UnistylesRegistry
  .addBreakpoints(breakpoints)
  .addThemes(themes)
  .addConfig({
    initialTheme,
    adaptiveThemes: true,
  });
