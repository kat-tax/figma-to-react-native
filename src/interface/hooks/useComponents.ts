import {useState, useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';

import type {PreviewComponent} from 'types/preview';
import type {EventLoadComponent} from 'types/events';

export interface Components {
  list: Record<string, boolean>,
  data: Record<string, PreviewComponent>,
  total: number,
  loaded: number,
  assets: number,
}

export function useComponents(): Components {
  const [list, setList] = useState<Components['list']>(null);
  const [data, setData] = useState<Components['data']>({});
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [assets, setAssets] = useState(0);
  useEffect(() => on<EventLoadComponent>('LOAD_COMPONENT', (_component, _components, _loaded, _total, _assets) => {
    setData({...data, [_component.name]: _component});
    setList(_components);
    setTotal(_total);
    setLoaded(_loaded);
    setAssets(_assets);
  }), [data]);
  return {list, data, total, loaded, assets};
}
