import {TiptapCollabProvider} from '@hocuspocus/provider';
import {TIPTAP_APP} from 'config/consts';
import * as random from 'common/random';

import type {Doc} from 'yjs';
import type {SyncService, SyncSettings} from './base';

export default class implements SyncService {
  createProvider(document: Doc, settings: SyncSettings) {
    return new TiptapCollabProvider({
      document,
      appId: settings.url,
      name: settings.docId,
      token: settings.token,
    });
  }

  getSettings() {
    return {
      url: TIPTAP_APP,
      docId: random.generateToken(22),
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MjExNzM1NjUsIm5iZiI6MTcyMTE3MzU2NSwiZXhwIjoxNzIxMjU5OTY1LCJpc3MiOiJodHRwczovL2Nsb3VkLnRpcHRhcC5kZXYiLCJhdWQiOiJsODlqbjNrNyJ9.S5LpcEWvqb7sgZcn5vbQ3znArPQvsWPbKWjUSSLTLLU',
    };
  }
}
