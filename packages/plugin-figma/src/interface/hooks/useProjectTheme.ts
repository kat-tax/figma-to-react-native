import {useState, useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';
import * as $ from 'interface/store';

import type {EventProjectTheme} from 'types/events';

export function useProjectTheme(): string {
  const [theme, setTheme] = useState<string>('default');

  useEffect(() => on<EventProjectTheme>('PROJECT_THEME', (code, current) => {
    setTheme(current);
    if (code !== $.getProjectTheme().toString()) {
      $.setProjectTheme(code);
    }
  }), []);

  return theme;
}
