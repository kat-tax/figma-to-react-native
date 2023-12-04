import * as Y from 'yjs';
import {WebrtcProvider} from 'y-webrtc';
//import {TiptapCollabProvider} from '@hocuspocus/provider';
//import {TIPTAP_APP_ID} from 'config/env';

export const doc = new Y.Doc();

export const provider = new WebrtcProvider('xxx', doc);
//export const provider = new TiptapCollabProvider({
//  appId: TIPTAP_APP_ID,
//  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MDE1MDgzNzEsIm5iZiI6MTcwMTUwODM3MSwiZXhwIjoxNzAxNTk0NzcxLCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoiMHg5bG52bXIifQ.PfH8-iCgKLQFt7LI0mEetPk0STdu47pcHJ6fvfqWRcw',
//  document: doc,
//  name: 'xxx',
//});

provider.connect();

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
