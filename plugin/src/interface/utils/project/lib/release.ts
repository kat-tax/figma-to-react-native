import {F2RN_SERVICE_URL} from 'config/consts';
import {emit} from '@create-figma-plugin/utilities';
import {create} from '../create';

import type {ProjectBuild, ProjectInfo} from 'types/project';
import type {ProjectSettings} from 'types/settings';
import type {EventNotify} from 'types/events';

export async function release(project: ProjectBuild, info: ProjectInfo, settings: ProjectSettings) {
  const blob = await create(project, info);
  const name = info.appConfig?.Design?.PACKAGE_NAME?.toString() || '';
  const version = info.appConfig?.Design?.PACKAGE_VERSION?.toString() || '0.0.0';
  const fileInfo = `${project.components.length}__${project.assets.length}`;
  const fileName = `${version}__${fileInfo}__${btoa(project.name)}__${btoa(name)}`;
  const filePath = `${settings.projectToken}/${fileName}.zip`;

  // const {data, error} = await supabase
  //   .storage
  //   .from('releases')
  //   .upload(filePath, blob, {
  //     contentType: 'application/zip',
  //   });

  // console.debug('[service/upload]', data, error);

  emit<EventNotify>('NOTIFY', 'Release published.', {
    button: ['Open Dashboard', `${F2RN_SERVICE_URL}/dashboard`],
    timeout: 10000,
  });
}
