import {on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'preact/hooks';

import type {UpdateThemeHandler} from 'types/events';

export function useTheme(): string {
  const [theme, setTheme] = useState<string>(null);
  useEffect(() => on<UpdateThemeHandler>('UPDATE_THEME', (_theme) => {
    setTheme(_theme);
  }), []);
  return theme;
}
