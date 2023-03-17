import {useState, useEffect} from 'react';
import {build} from 'utils/esbuild';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings) {
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!component) return;

    const preview = `
      import {AppRegistry} from 'react-native';
      ${component.bundle}
      AppRegistry.registerComponent('preview', () => ${component.name});
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
