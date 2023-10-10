import {useRef, useEffect, useCallback} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';
import {log} from 'interface/telemetry';

import {upload} from 'interface/utils/upload';
import {download} from 'interface/utils/download';
import {sync, init} from 'interface/utils/sync';

import type {StateUpdater} from 'preact/hooks';
import type {EventProjectBuild} from 'types/events';
import type {SyncSession} from 'interface/utils/sync';

export function useProjectBuild(showSuccess: () => void, setExportCount: StateUpdater<number>): void {
  const session = useRef<SyncSession>(null);

  const launch = useCallback((key: string) => {
    const url = 'http://127.0.0.1:5102'; // 'https://fig.run';
    open(`${url}/#/${key}`);
  }, []);

  useEffect(() => on<EventProjectBuild>('PROJECT_BUILD', async (project, config, user) => {
    const assets = project.assets.length;
    const components = project.components.length;
    switch (config.method) {
      case 'download':
        download(project);
        break;
      case 'release':
        upload(project, config);
        break;
      case 'preview':
        const key = `${user.name.toLowerCase().replace(/\s/g, '+')}/${project.id}`;
        session.current = init(key, config.apiKey);
        sync(session.current, project);
        launch(key);
        break;
    }
    showSuccess();
    setExportCount(components);
    log(`export_${config.method}_complete`, {components, assets});
  }), []);
}
