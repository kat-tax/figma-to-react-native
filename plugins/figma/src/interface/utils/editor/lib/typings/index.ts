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
    shareCache: false,
    preloadPackages: true,
    debounceDuration: 0,
    fileRecursionDepth: 3,
    packageRecursionDepth: 2,
    onlySpecifiedPackages: true,
    fileRootPath: F2RN_EDITOR_NS,
    onUpdate(update, textual) {
      console.log('>>> [at-update]', update, textual);
    },
    versions: {
      'react': 'latest',
      'react-dom': 'latest',
      'react-exo': 'latest',
      'react-native': 'latest',
      'react-native-svg': 'latest',
      'react-native-unistyles': 'latest',
      'prop-types': 'latest',
      'csstype': 'latest',
    },
    onError(error) {
      console.error('[at-error]', error);
    },
  });
}

export default {init};
