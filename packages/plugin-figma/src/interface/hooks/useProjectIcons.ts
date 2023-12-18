import {useState, useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';

import type {EventProjectIcons} from 'types/events';
import type {ProjectIcons} from 'types/project';

export function useProjectIcons(): ProjectIcons {
  const [sets, setSets] = useState<string[]>([]);
  const [list, setList] = useState<string[]>([]);
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => on<EventProjectIcons>('PROJECT_ICONS', (sets, list, map) => {
    setSets(sets);
    setList(list);
    setMap(map);
  }), []);

  return {sets, list, map};
}
