import {AutoTypings} from 'monaco-editor-auto-typings/custom-editor';
import {SourceCache} from './SourceCache';
import {SourceResolver} from './SourceResolver';
import {F2RN_EDITOR_NS} from 'config/consts';

import type {Monaco, Editor} from 'interface/utils/editor';

const sourceCache = new SourceCache();
const sourceResolver = new SourceResolver();

function init(monaco: Monaco, editor: Editor) {
  AutoTypings.create(editor, {
    monaco,
    sourceCache,
    sourceResolver,
    shareCache: true,
    preloadPackages: true,
    debounceDuration: 6000,
    fileRootPath: F2RN_EDITOR_NS,
    versions: {
      '@types/react': '17.0.2',
      '@types/prop-types': '15.7.11',
      'csstype': '3.1.3',
      'react': '17.0.2',
      'react-native': '0.73.3',
      'react-native-svg': '15.0.0',
      'react-exo': '0.17.1',
      'styles': 'latest',
    },
    onError(error) {
      console.error('[at-error]', error);
    },
  });
}

export default {init};
