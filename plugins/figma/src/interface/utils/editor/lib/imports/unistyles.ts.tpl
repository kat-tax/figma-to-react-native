import {themes, breakpoints} from 'theme';

type AppThemes = {[K in keyof typeof themes]: typeof themes[K]};
type AppBreakpoints = typeof breakpoints;

declare module 'styles' {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}
