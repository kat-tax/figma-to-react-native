import {useMonaco} from '@monaco-editor/react';
import {useEffect} from 'preact/hooks';
import * as lib from 'interface/utils/editor/setup';

import type {Settings} from 'types/settings';
import type {ComponentLinks} from 'types/component';

export function useEditor(settings: Settings, links?: ComponentLinks) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;
    return lib.setupFileOpener(monaco, links);
  }, [monaco, links]);

  useEffect(() => {
    if (!monaco) return;
    lib.setupSettingsSchema(monaco);
  }, [monaco]);

  useEffect(() => {
    if (!monaco) return;
    lib.setupTypescript(monaco, settings);
  }, [monaco, settings]);

  return monaco;
}
