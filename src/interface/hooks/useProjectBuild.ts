import {useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';
import {log} from 'interface/telemetry';
import {upload} from 'interface/utils/export/upload';
import {download} from 'interface/utils/export/download';

import type {StateUpdater} from 'preact/hooks';
import type {EventProjectBuild} from 'types/events';

export function useProjectBuild(showSuccess: () => void, setExportCount: StateUpdater<number>): void {
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
        const url = 'http://127.0.0.1:5102'; // 'https://fig.run';
        open(`${url}/#/${project.id}`);
        break;
    }
    showSuccess();
    setExportCount(components);
    log(`export_${config.method}_complete`, {components, assets});
  }), []);
}
