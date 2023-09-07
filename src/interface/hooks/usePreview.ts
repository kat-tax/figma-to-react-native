import {useState, useEffect} from 'preact/hooks';
import {getPreview} from 'interface/preview';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings): string {
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!component || !component.preview) return;
    const tag = '<' + component.name + component.props + '/>';
    getPreview(component.preview, tag, settings).then(setOutput);
  }, [component, settings]);

  return output;
}
