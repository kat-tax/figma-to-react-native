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
    debounceDuration: 0,
    onlySpecifiedPackages: true,
    fileRootPath: F2RN_EDITOR_NS,
    versions: {
      '@lingui/core': '4.10.0',
      '@lingui/react': '4.10.0',
      '@lingui/macro': '4.10.0',
      '@types/react': '17.0.2',
      'react-native': 'latest',
      'react': '17.0.2',
      'react-native-svg': '15.0.0',
      'react-exo': '0.17.1',
      'react-native-unistyles': '2.31.0',
    },
    onError(error) {
      console.error('[at-error]', error);
    },
  });
}

export default {init};
