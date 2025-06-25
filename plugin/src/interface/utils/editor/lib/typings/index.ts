import {AutoTypings} from 'monaco-editor-auto-typings/custom-editor';
import {SourceCache} from './SourceCache';
import {SourceResolver} from './SourceResolver';
import {F2RN_EDITOR_NS} from 'config/consts';

import type {Monaco, MonacoEditor} from 'interface/utils/editor/monaco';

const sourceCache = new SourceCache();
const sourceResolver = new SourceResolver();

function init(monaco: Monaco, editor: MonacoEditor) {
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
    // onUpdate(update, textual) {
    //   console.log('>>> [at-update]', update, textual);
    // },
    // onError(error) {
    //   console.error('>>> [at-error]', error);
    // },
  });
}

export default {init};
