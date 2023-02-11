import {useState, useEffect} from 'react';
import {html} from 'interface/templates';
import {build} from 'utils/esbuild';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!component) return;
    build(html.runtime
      .replace('__NAME__', component.name)
      .replace('__CODE__', component.code),
      settings,
    )
    .then(res => setCode(res.code))
    .catch(e => setCode(e.toString()))
  }, [component, settings]);

  return code;
}
