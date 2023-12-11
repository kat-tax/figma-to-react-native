import * as Y from 'yjs';
import {WebrtcProvider} from 'y-webrtc';
// import {createYjsProvider} from '@y-sweet/client';

export const doc = new Y.Doc();

export const provider = new WebrtcProvider('xxx', doc);

provider.connect();

export const assets = doc.getMap<Uint8Array>('assets');

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

export function getComponentCode(name: string) {
  return doc.getText(`code::${name}`);
}

export function setComponentCode(name: string, code: string) {
  const text = doc.getText(`code::${name}`);
  text.delete(0, text.length);
  text.insert(0, code);
}

export function getComponentIndex(name: string) {
  const text = doc.getText(`index::${name}`);
  return text.toString();
}

export function setComponentIndex(name: string, code: string) {
  const text = doc.getText(`index::${name}`);
  text.delete(0, text.length)
  text.insert(0, code);
}

export function setComponentStory(name: string, code: string) {
  const text = doc.getText(`story::${name}`);
  text.delete(0, text.length)
  text.insert(0, code);
}

export function getComponentStory(name: string) {
  const text = doc.getText(`story::${name}`);
  return text.toString();
}
