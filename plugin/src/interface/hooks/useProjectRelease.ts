import {useEffect} from 'react';
import {on, emit} from '@create-figma-plugin/utilities';
import {log} from 'interface/telemetry';
import {update} from 'interface/utils/project/update';
import {release} from 'interface/utils/project/lib/release';
import {download} from 'interface/utils/project/lib/download';
import {F2RN_PREVIEW_URL} from 'config/consts';

import type {EventNotify, EventProjectRelease} from 'types/events';

export function useProjectRelease(onSuccess: () => void): void {
  useEffect(() => on<EventProjectRelease>('PROJECT_RELEASE', async (info, build, settings, config, form) => {
    if (build === null)
      return emit<EventNotify>('NOTIFY', 'Failed to build project.', {error: true});
    const assets = build.assets.length;
    const components = build.components.length;
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
          open(`${F2RN_PREVIEW_URL}/#/${config.docKey}`);
          break;
        default: form.method satisfies never;
      }
      onSuccess();
      emit<EventNotify>('NOTIFY', 'Project exported successfully.');
    } catch(e) {
      console.error('>>> Failed to export', e);
      emit<EventNotify>('NOTIFY',  e instanceof Error ? e.message : 'Unknown error', {error: true});
    }
    log(`export_${form.method}_complete`, {components, assets});
  }), []);
}
