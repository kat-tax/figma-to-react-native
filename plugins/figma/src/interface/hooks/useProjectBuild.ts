import {useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';
import {log} from 'interface/telemetry';
import {upload} from 'interface/utils/project/upload';
import {download} from 'interface/utils/project/download';

import type {EventProjectBuild} from 'types/events';

export function useProjectBuild(
  onSuccess: () => void,
  onError: () => void,
  setExportCount: React.Dispatch<number>,
): void {
  useEffect(() => on<EventProjectBuild>('PROJECT_BUILD', async (project, config, user) => {
    if (project === null) {
      onError();
      return;
    }
    const assets = project.assets.length;
    const components = project.components.length;
    switch (config.method) {
      case 'download':
        download(project, config);
        break;
      case 'release':
        upload(project, config);
        break;
      case 'preview':
        const url = 'http://127.0.0.1:5102'; // 'https://fig.run';
        open(`${url}/#/${config.docKey}`);
        break;
    }
    onSuccess();
    setExportCount(components);
    log(`export_${config.method}_complete`, {components, assets});
  }), []);
}
