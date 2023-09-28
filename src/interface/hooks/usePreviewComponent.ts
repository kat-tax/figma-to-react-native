import {on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'preact/hooks';
import {PreviewComponent} from 'types/preview';

import type {EventPreviewComponent} from 'types/events';

export function usePreviewComponent(): PreviewComponent {
  const [component, setComponent] = useState<PreviewComponent>(null);
  useEffect(() => on<EventPreviewComponent>('PREVIEW_COMPONENT', (payload) => {
    setComponent(JSON.parse(payload));
  }), []);
  return component;
}
