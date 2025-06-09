import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';

import type {EventProjectIcons} from 'types/events';
import type {ProjectIcons} from 'types/project';

export function useProjectIcons(): ProjectIcons {
  const [sets, setSets] = useState<string[]>([]);
  const [list, setList] = useState<string[]>([]);
  const [maps, setMaps] = useState<Record<string, string>>({});
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => on<EventProjectIcons>('PROJECT_ICONS', (sets, list, maps, names) => {
    setSets(sets);
    setList(list);
    setMaps(maps);
    setNames(names);
  }), []);

  return {sets, list, maps, names};
}
