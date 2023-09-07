import {TiptapCollabProvider} from '@hocuspocus/provider';
import * as Y from 'yjs';

export type Session = {
  document: Y.Doc,
  provider: TiptapCollabProvider,
};

export function sync(key: string): Session {
  const document = new Y.Doc();
  const provider = new TiptapCollabProvider({
    appId: 'l89jn3k7',
    token: '',
    name: key,
    document,
  });
  return {document, provider};
}
