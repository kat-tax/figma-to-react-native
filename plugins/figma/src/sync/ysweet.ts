import {createYjsProvider} from '@y-sweet/client';
import {YSWEET_URL} from 'config/consts';
import * as random from 'common/random';

import type {Doc} from 'yjs';
import type {SyncService, SyncSettings} from './base';

export default class implements SyncService {
  createProvider(document: Doc, settings: SyncSettings) {
    return createYjsProvider(document, settings, {
      connect: true,
    });
  }

  getSettings() {
    return {
      url: YSWEET_URL,
      docId: random.generateToken(22),
      token: 'xxx',
    };
  }
}
