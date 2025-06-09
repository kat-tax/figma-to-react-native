import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';
import * as $ from 'store';

import type {EventProjectTheme} from 'types/events';

export function useProjectTheme(): string {
  const [hasStyles, setHasStyles] = useState(false);
  const [theme, setTheme] = useState('default');

  useEffect(() => on<EventProjectTheme>('PROJECT_THEME', (code, current, hasStyles) => {
    setTheme(current);
    setHasStyles(hasStyles);
    if (code !== $.projectTheme.toString()) {
      $.projectTheme.set(code);
    }
  }), []);

  return hasStyles ? theme : '';
}
