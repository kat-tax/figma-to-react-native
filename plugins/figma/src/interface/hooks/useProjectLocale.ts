import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';

import type {EventProjectLocale} from 'types/events';

export function useProjectLocale(): string {
  const [locale, setLocale] = useState('en-US');

  useEffect(() => on<EventProjectLocale>('PROJECT_LOCALE', (locale) => {
    setLocale(locale);
  }), []);

  return locale;
}
