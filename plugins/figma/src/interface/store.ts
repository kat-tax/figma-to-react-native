import * as Y from 'yjs';
import {WebrtcProvider} from 'y-webrtc';
// import {createYjsProvider} from '@y-sweet/client';
//import {TiptapCollabProvider} from '@hocuspocus/provider';
//import {TIPTAP_APP_ID} from 'config/env';

export const doc = new Y.Doc();

export const provider = new WebrtcProvider('xxx', doc);
/*export const provider = new TiptapCollabProvider({
  appId: TIPTAP_APP_ID,
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MDQwNjQxMzksIm5iZiI6MTcwNDA2NDEzOSwiZXhwIjoxNzA0MTUwNTM5LCJpc3MiOiJodHRwczovL2Nsb3VkLnRpcHRhcC5kZXYiLCJhdWQiOiIweDlsbnZtciJ9.0EHkh0ZWqTgjJUSGh03OMexZcfc3BsnQ9wOiU3_-VkI',
  name: figma.fileKey,
  document: doc,
});*/

provider.connect();

export const assets = doc.getMap<Uint8Array>('assets');

export const components = doc.getMap<{
  id: string,
  key: string,
  name: string,
  page: string,
  path: string,
  props: string,
  imports: string,
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

export function getComponentStory(key: string) {
  const text = doc.getText(`story::${key}`);
  return text.toString();
}

export function setComponentStory(key: string, code: string) {
  const text = doc.getText(`story::${key}`);
  text.delete(0, text.length)
  text.insert(0, code);
}

export function getComponentDocs(key: string) {
  return doc.getText(`docs::${key}`);
}

export function setComponentDocs(key: string, code: string) {
  const text = doc.getText(`docs::${key}`);
  text.delete(0, text.length)
  text.insert(0, code);
}
