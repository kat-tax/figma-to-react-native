import {useState, useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';

import type {EventPreviewTheme} from 'types/events';

export function usePreviewTheme(): string {
  const [theme, setTheme] = useState<string>(null);
  useEffect(() => on<EventPreviewTheme>('PREVIEW_THEME', (_theme) => {
    setTheme(_theme);
  }), []);
  return theme;
}
