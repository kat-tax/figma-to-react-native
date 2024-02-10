import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';

import type {ProjectRelease} from 'types/project';
import type {EventProjectConfigLoad} from 'types/events';

export function useProjectConfig(): ProjectRelease {
  const [config, setConfig] = useState<ProjectRelease>();

  useEffect(() => on<EventProjectConfigLoad>('PROJECT_CONFIG_LOAD', (config) => {
    setConfig(config);
  }), []);

  return config;
}
