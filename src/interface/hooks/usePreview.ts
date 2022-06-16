import {useState, useEffect} from 'react';
import {preview} from 'interface/templates';
import {build} from 'utils/esbuild';

import type {Component} from 'types/plugin';
import type {Settings} from 'types/settings';

export function usePreview(component: Component, settings: Settings) {
  const [html, setHTML] = useState('');

  useEffect(() => {
    if (!component) return;
    build(preview.runtime
      .replace('__NAME__', component.name)
      .replace('__CODE__', component.code),
      settings,
    )
    .then(res => setHTML(preview.shell
      .replace('__MODULE__', res.code)
      .replace('__IMPORTS__', preview.imports)
    ))
    .catch(err => setHTML(preview.error
      .replace('__ERROR__', err.toString())
    ));
  }, [component, settings]);

  return html;
}
