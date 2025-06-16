import {F2RN_SERVICE_URL} from 'config/consts';
import supabase from 'interface/services/supabase';
import {emit} from '@create-figma-plugin/utilities';
import {create} from '../create';

import type {ProjectBuild, ProjectInfo, ProjectConfig} from 'types/project';
import type {EventNotify} from 'types/events';

export async function release(project: ProjectBuild, info: ProjectInfo, release: ProjectConfig) {
  const blob = await create(project, info, release);

  const name = info.appConfig?.Design?.PACKAGE_NAME?.toString() || '';
  const version = info.appConfig?.Design?.PACKAGE_VERSION?.toString() || '0.0.0';
  const fileInfo = `${project.components.length}__${project.assets.length}`;
  const fileName = `${version}__${fileInfo}__${btoa(project.name)}__${btoa(name)}`;
  const filePath = `${release.apiKey}/${release.docKey}/${fileName}.zip`;

  const {data, error} = await supabase
    .storage
    .from('releases')
    .upload(filePath, blob, {
      contentType: 'application/zip',
    });

  console.debug('[service/upload]', data, error);

  emit<EventNotify>('NOTIFY', 'Release published.', {
    button: ['Open Dashboard', `${F2RN_SERVICE_URL}/dashboard`],
    timeout: 10000,
  });
}
