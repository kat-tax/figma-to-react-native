import {useState, useEffect} from 'react';
import {build} from 'utils/esbuild';
import tpl from '../templates';

import type {Settings} from 'types/settings';
import type {Component} from 'types/plugin';

export function usePreview(component: Component, settings: Settings) {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!component) return;
    build(tpl.runtime
      .replace('__NAME__', component.name)
      .replace('__CODE__', component.code),
      settings,
    )
    .then(res => setPreview(tpl.shell
      .replace('__MODULE__', res.code)
      .replace('__IMPORTS__', tpl.imports)
    ))
    .catch(err => setPreview(tpl.error
      .replace('__ERROR__', err.toString())
    ));
  }, [component, settings]);

  return preview;
}
