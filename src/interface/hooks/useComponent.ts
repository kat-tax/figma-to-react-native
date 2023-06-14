import {on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'preact/hooks';
import {EditorComponent} from 'types/editor';

import type {UpdateCodeHandler} from 'types/events';

export function useComponent(): EditorComponent {
  const [component, setComponent] = useState<EditorComponent>(null);
  useEffect(() => on<UpdateCodeHandler>('UPDATE_CODE', (payload) => {
    setComponent(JSON.parse(payload));
  }), []);
  return component;
}
