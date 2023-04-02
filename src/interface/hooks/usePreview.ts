import {useState, useEffect} from 'react';
import {build} from 'utils/esbuild';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings) {
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!component) return;

    const bundle = component.bundle
      .replace(/import\s*\{\s*(\w+)\s*\}\s*from\s*['"](\.\/\w+\.tsx?)['"]\s*;/g, '');

    const preview = `
      import {AppRegistry} from 'react-native';
      import {useEffect, useState} from 'react';
      import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';

      ${bundle}

      function Preview() {
        return (
          <TransformComponent wrapperStyle={{height: '100%', width: '100%'}}>
            ${'<' + component.name + '/>'}
          </TransformComponent>
        );
      }

      function Main() {
        return (
          <TransformWrapper centerOnInit>
            <Preview/>
          </TransformWrapper>
        );
      }

      AppRegistry.registerComponent('preview', () => Main);
      AppRegistry.runApplication('preview', {
        rootTag: document.getElementById('preview'),
      });
    `;

    build(preview, settings)
      .then(res => setOutput(res.code))
      .catch(err => setOutput(err.toString()));

  }, [component, settings]);

  return output;
}
