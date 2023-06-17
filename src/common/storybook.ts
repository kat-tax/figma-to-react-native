import {WebsocketProvider} from 'y-websocket';
import * as Y from 'yjs';

export type Session = {
  document: Y.Doc,
  provider: WebsocketProvider,
};

export function open(key: string) {
  const url = 'http://localhost:5102';
  window.open(`${url}/#/${key}`);
}

export function sync(key: string): Session {
  const document = new Y.Doc();
  const provider = new WebsocketProvider('ws://localhost:1234', key, document);
  return {document, provider};
}
