import {useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';
import {log} from 'interface/telemetry';
import {update} from 'interface/utils/project/update';
import {release} from 'interface/utils/project/lib/release';
import {download} from 'interface/utils/project/lib/download';
import * as consts from 'config/consts';

import type {EventProjectRelease} from 'types/events';

export function useProjectRelease(
  onSuccess: () => void,
  onError: (msg: string) => void,
  setExportCount: React.Dispatch<number>,
): void {
  useEffect(() => on<EventProjectRelease>('PROJECT_RELEASE', async (project, info, config) => {
    if (project === null)
      return onError('Unable to build project.');
    const assets = project.assets.length;
    const components = project.components.length;
    setExportCount(components);
    try {
      switch (config.method) {
        case 'download':
          await download(project, info, config);
          break;
        case 'push':
          await update(project, info, config);
          break;
        case 'sync':
          open(`${consts.F2RN_PREVIEW_URL}/sync/${config.docKey}`);
          break;
        case 'release':
          await release(project, info, config);
          break;
        case 'preview':
          open(`${consts.F2RN_PREVIEW_URL}/#/${config.docKey}`);
          break;
        default: config.method satisfies never;
      }
      onSuccess();
    } catch(e) {
      console.error('>>> Failed to export', e);
      onError(e instanceof Error ? e.message : 'Unknown error');
    }
    log(`export_${config.method}_complete`, {components, assets});
  }), [onSuccess, onError, setExportCount]);
}
