import * as Y from 'yjs';
import {WebrtcProvider} from 'y-webrtc';

export const doc = new Y.Doc();

export const components = doc.getMap<{
  id: string,
  page: string,
  name: string,
  props: string,
}>('components');

export const project = doc.getMap<{
  index: Y.Text,
  theme: Y.Text,
}>('project');

export function sync(key: string) {
  const provider = new WebrtcProvider(key, doc);
  const connect = () => provider.connect();
  const disconnect = () => provider.disconnect();
  return {provider, connect, disconnect};
}

export function getComponentCode(key: string) {
  return doc.getText(`code::${key}`);
}

export function setComponentCode(key: string, code: string) {
  const text = doc.getText(`code::${key}`);
  text.delete(0, text.length)
  text.insert(0, code);
}

export function getComponentIndex(key: string) {
  const text = doc.getText(`index::${key}`);
  return text.toString();
}

export function setComponentIndex(key: string, code: string) {
  const text = doc.getText(`index::${key}`);
  text.delete(0, text.length)
  text.insert(0, code);
}

export function setComponentStory(key: string, code: string) {
  const text = doc.getText(`story::${key}`);
  text.delete(0, text.length)
  text.insert(0, code);
}

export function getComponentStory(key: string) {
  const text = doc.getText(`story::${key}`);
  return text.toString();
}
