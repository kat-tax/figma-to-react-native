import {useState, useEffect} from 'preact/hooks';
import {on} from 'common/events';

import type {EventPreviewTheme} from 'types/events';

export function usePreviewTheme(): string {
  const [theme, setTheme] = useState<string>('');
  useEffect(() => on<EventPreviewTheme>('PREVIEW_THEME', (_theme) => {
    setTheme(_theme);
  }), []);
  return theme;
}
