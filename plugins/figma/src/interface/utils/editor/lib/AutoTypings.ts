import {AutoTypings} from 'monaco-editor-auto-typings/custom-editor';
import {F2RN_EDITOR_NS} from 'config/env';

import type {SourceCache} from 'monaco-editor-auto-typings/custom-editor';
import type {Monaco, Editor} from 'interface/utils/editor';

const versions =  {
  '@types/react': '17.0.2',
  '@types/prop-types': '15.7.11',
  'csstype': '3.1.3',
  'react-native': '0.73.3',
  'react-native-exo': '0.9.11',
  'react-native-svg': '13.14.0',
  'react-native-unistyles': '2.1.1',
};

export class AutoTypeCache implements SourceCache {
  static NS = 'at-cache::';
  static _ = new Map<string, string>();

  constructor() {
    //Object.keys(localStorage).forEach((key) => {
    //  if (key.startsWith(AutoTypeCache.NS)) {
    //    const uri = key.replace(AutoTypeCache.NS, '');
        //AutoTypeCache._.set(uri, localStorage.getItem(key));
    //  }
    //});
  }

  async getFile(uri: string) {
    return AutoTypeCache._.get(uri);
  }

  async storeFile(uri: string, content: string) {
    //console.log('[at-cache]', uri, content.length);
    AutoTypeCache._.set(uri, content);
  }

  async clear() {
    AutoTypeCache._.clear();
  }
}

const sourceCache = new AutoTypeCache();

export function init(monaco: Monaco, editor: Editor) {
  AutoTypings.create(editor, {
    monaco,
    versions,
    sourceCache,
    shareCache: true,
    preloadPackages: true,
    debounceDuration: 6000,
    fileRootPath: F2RN_EDITOR_NS,
  });
}

export default {
  AutoTypeCache,
  sourceCache,
  init,
};
