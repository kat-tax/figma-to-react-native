import {useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';
import {log} from 'interface/telemetry';
import {upload} from 'interface/utils/project/upload';
import {download} from 'interface/utils/project/download';
import * as consts from 'config/consts';

import type {EventProjectBuild} from 'types/events';

export function useProjectBuild(
  onSuccess: () => void,
  onError: () => void,
  setExportCount: React.Dispatch<number>,
): void {
  useEffect(() => on<EventProjectBuild>('PROJECT_BUILD', async (project, info, config) => {
    if (project === null) return onError();
    const assets = project.assets.length;
    const components = project.components.length;
    switch (config.method) {
      case 'download':
        download(project, info, config);
        break;
      case 'release':
        upload(project, info, config);
        break;
      case 'preview':
        open(`${consts.F2RN_PREVIEW_URL}/#/${config.docKey}`);
        break;
    }
    onSuccess();
    setExportCount(components);
    log(`export_${config.method}_complete`, {components, assets});
  }), [onSuccess, onError, setExportCount]);
}
