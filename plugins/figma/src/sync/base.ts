import type {Doc} from 'yjs';
import type {ClientToken} from '@y-sweet/sdk';
import type {YSweetProvider} from '@y-sweet/client';
import type {TiptapCollabProvider} from '@hocuspocus/provider';

export type SyncProvider = YSweetProvider | TiptapCollabProvider;
export type SyncSettings = ClientToken;

export interface SyncService {
  createProvider: (document: Doc, settings: SyncSettings) => SyncProvider;
  getSettings: () => SyncSettings;
}
