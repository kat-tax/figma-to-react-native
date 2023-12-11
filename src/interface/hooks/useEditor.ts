import {useMonaco} from '@monaco-editor/react';
import {useEffect} from 'preact/hooks';
import * as lib from 'interface/utils/code';

import type {Settings} from 'types/settings';
import type {ComponentLinks} from 'types/component';

export function useEditor(settings: Settings, links?: ComponentLinks) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;
    return lib.initFileOpener(monaco, links);
  }, [monaco, links]);

  useEffect(() => {
    if (!monaco) return;
    lib.initSettingsSchema(monaco);
  }, [monaco]);

  useEffect(() => {
    if (!monaco) return;
    lib.initTypescript(monaco, settings);
  }, [monaco, settings]);

  return monaco;
}
