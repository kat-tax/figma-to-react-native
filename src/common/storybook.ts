import {TiptapCollabProvider} from '@hocuspocus/provider';
import * as Y from 'yjs';

export type Session = {
  document: Y.Doc,
  provider: TiptapCollabProvider,
};

export function open(key: string) {
  const url = 'http://localhost:5102';
  window.open(`${url}/#/${key}`);
}

export function sync(key: string): Session {
  const document = new Y.Doc();
  const provider = new TiptapCollabProvider({
    appId: '',
    token: '',
    name: key,
    document,
  });
  return {document, provider};
}
