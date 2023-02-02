import {useState, useEffect} from 'react';
import {html} from 'interface/templates';
import {build} from 'utils/esbuild';

import type {Component} from 'types/plugin';
import type {Settings} from 'types/settings';

export function usePreview(component: Component, settings: Settings) {
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
