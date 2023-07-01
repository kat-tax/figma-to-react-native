import {useState, useEffect} from 'preact/hooks';
import {build} from 'common/esbuild';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings): string {
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!component) return;

    const tag = '<' + component.name + component.props + '/>';

    const entryPoint = `
      import React, {useEffect, useState} from 'react';
      import {AppRegistry} from 'react-native';

      ${component.preview}

      function Main() {
        return ${tag}
      }

      AppRegistry.registerComponent('main', () => Main);
      AppRegistry.runApplication('main', {
        rootTag: document.getElementById('component'),
      });
    `;

    build(entryPoint, settings)
      .then(res => setOutput(res.code
        .replace(/stdin_default as default\,?/, '')
        .replace('var stdin_default', 'var theme')))
      .catch(err => setOutput(err.toString()));

  }, [component, settings]);

  return output;
}
