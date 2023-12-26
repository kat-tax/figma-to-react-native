import {useState, useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';
import * as $ from 'interface/store';

import type {EventProjectTheme} from 'types/events';

export function useProjectTheme(): string {
  const [hasStyles, setHasStyles] = useState(false);
  const [theme, setTheme] = useState('default');

  useEffect(() => on<EventProjectTheme>('PROJECT_THEME', (code, current, hasStyles) => {
    setTheme(current);
    setHasStyles(hasStyles);
    if (code !== $.getProjectTheme().toString()) {
      $.setProjectTheme(code);
    }
  }), []);

  return hasStyles ? theme : '';
}
