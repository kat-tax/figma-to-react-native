import * as Y from 'yjs';
import {WebrtcProvider} from 'y-webrtc';
// import {createYjsProvider} from '@y-sweet/client';

export const doc = new Y.Doc();

export const provider = new WebrtcProvider('xxx', doc);

provider.connect();

export const assets = doc.getMap<Uint8Array>('assets');

export const components = doc.getMap<{
  id: string,
  key: string,
  name: string,
  page: string,
  props: string,
  width: number,
  height: number,
}>('components');

export const project = doc.getMap<{
  index: Y.Text,
  theme: Y.Text,
}>('project');

export function sync(key: string) {
  const connect = () => provider.connect();
  const disconnect = () => provider.disconnect();
  return {connect, disconnect};
}

// Setters and getters

export function setProjectFiles(files: string[]) {
  const $files = doc.getArray<string>('files');
  $files.delete(0, $files.length);
  files.forEach(file => $files.push([file]));
}

export function getProjectTheme() {
  return doc.getText('theme');
}

export function setProjectTheme(theme: string) {
  const text = doc.getText('theme');
  text.delete(0, text.length);
  text.insert(0, theme);
}

export function getProjectIndex() {
  return doc.getText('index');
}

export function setProjectIndex(index: string) {
  const text = doc.getText('index');
  text.delete(0, text.length);
  text.insert(0, index);
}

export function getComponentCode(key: string) {
  return doc.getText(`code::${key}`);
}

export function setComponentCode(key: string, code: string) {
  const text = doc.getText(`code::${key}`);
  text.delete(0, text.length);
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
