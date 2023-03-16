import {useState, useEffect} from 'react';
import {build} from 'utils/esbuild';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!component) return;

    // TEMP CODE USED FOR TESTING W/O BUNDLE
    const componentCode = component.code
      .replace(
        /import\s*\{\s*(\w+)\s*\}\s*from\s*['"](\.\/\w+\.tsx?)['"]\s*;/g,
        `import {Fragment as $1} from "react";`,
      );

    const entryPoint = `
      import {AppRegistry} from 'react-native';

      ${componentCode}
      
      AppRegistry.registerComponent('preview', () => ${component.name});
      AppRegistry.runApplication('preview', {
        rootTag: document.getElementById('preview'),
      });
    `;

    build(entryPoint, settings)
      .then(res => setCode(res.code))
      .catch(err => setCode(err.toString()));

  }, [component, settings]);

  return code;
}
