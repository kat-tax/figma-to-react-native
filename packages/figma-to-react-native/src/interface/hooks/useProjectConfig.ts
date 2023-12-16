import {useState, useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';

import type {ProjectConfig} from 'types/project';
import type {EventProjectConfigLoad} from 'types/events';

export function useProjectConfig(): ProjectConfig {
  const [config, setConfig] = useState<ProjectConfig>();

  useEffect(() => on<EventProjectConfigLoad>('PROJECT_CONFIG_LOAD', (config) => {
    setConfig(config);
  }), []);

  return config;
}
