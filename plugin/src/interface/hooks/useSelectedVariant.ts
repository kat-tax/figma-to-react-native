import {useState, useEffect, useMemo} from 'react';
import {on} from '@create-figma-plugin/utilities';

import type {EventSelectVariant} from 'types/events';

export type VariantData = {
  name: string,
  props: {[property: string]: string},
}

export function useSelectedVariant(): VariantData {
  const [name, setName] = useState<string>('');
  const [props, setProps] = useState<{[property: string]: string}>({});

  useEffect(() => on<EventSelectVariant>('SELECT_VARIANT', (name, props) => {
    setName(name);
    setProps(props);
  }), []);

  return useMemo(() => ({props, name}), [props, name]);
}
