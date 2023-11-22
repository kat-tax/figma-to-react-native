import {useState, useEffect} from 'preact/hooks';
import {on} from 'common/events';

import type {ProjectConfig} from 'types/project';
import type {EventProjectConfigLoad} from 'types/events';

export function useProjectConfig(): ProjectConfig | null {
  const [config, setConfig] = useState<ProjectConfig | null>(null);

  useEffect(() => on<EventProjectConfigLoad>('PROJECT_CONFIG_LOAD', (config) => {
    setConfig(config);
  }), []);

  return config;
}
