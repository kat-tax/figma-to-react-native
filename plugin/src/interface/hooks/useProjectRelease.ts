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
  useEffect(() => on<EventProjectRelease>('PROJECT_RELEASE', async (info, build, settings, config, form) => {
    if (build === null)
      return onError('Unable to build project.');
    const assets = build.assets.length;
    const components = build.components.length;
    setExportCount(components);
    try {
      switch (form.method) {
        case 'zip':
          await download(build, info, config);
          break;
        case 'git':
          await update(build, info, config);
          break;
        case 'npm':
          await release(build, info, config);
          break;
        case 'run':
          open(`${consts.F2RN_PREVIEW_URL}/#/${config.docKey}`);
          break;
        default: form.method satisfies never;
      }
      onSuccess();
    } catch(e) {
      console.error('>>> Failed to export', e);
      onError(e instanceof Error ? e.message : 'Unknown error');
    }
    log(`export_${form.method}_complete`, {components, assets});
  }), [onSuccess, onError, setExportCount]);
}
