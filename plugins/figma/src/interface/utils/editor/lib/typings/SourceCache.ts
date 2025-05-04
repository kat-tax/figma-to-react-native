import type {SourceCache as SourceCacheBase} from 'monaco-editor-auto-typings/custom-editor';

export class SourceCache implements SourceCacheBase {
  static NS = 'type:';
  static _ = new Map<string, string>();

  async getFile(uri: string) {
    console.log('>>> [at-cache:get]', uri);
    return SourceCache._.get(uri);
  }

  async storeFile(uri: string, content: string) {
    console.log('>>> [at-cache:set]', uri, content.length);
    SourceCache._.set(uri, content);
  }

  async clear() {
    SourceCache._.clear();
  }
}
