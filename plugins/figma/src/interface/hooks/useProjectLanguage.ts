import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';

import type {EventProjectLanguage} from 'types/events';

export function useProjectLanguage(): string {
  const [language, setLanguage] = useState('English');

  useEffect(() => on<EventProjectLanguage>('PROJECT_LANGUAGE', (language) => {
    setLanguage(language);
  }), []);

  return language;
}
