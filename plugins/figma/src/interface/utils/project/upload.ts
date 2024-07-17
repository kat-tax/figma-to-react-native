import supabase from 'interface/services/supabase';
import {create} from './create';

import type {ProjectBuild, ProjectInfo, ProjectRelease} from 'types/project';

export async function upload(build: ProjectBuild, info: ProjectInfo, release: ProjectRelease) {
  const project = await create(build, info, release);

  const name = info.appConfig?.Design?.PACKAGE_NAME?.toString() || '';
  const version = info.appConfig?.Design?.PACKAGE_VERSION?.toString() || '0.0.0';
  const fileInfo = `${build.components.length}__${build.assets.length}`;
  const fileName = `${version}__${fileInfo}__${btoa(build.name)}__${btoa(name)}`;
  const filePath = `${release.apiKey}/${release.docKey}/${fileName}.zip`;
  
  const {data, error} = await supabase
    .storage
    .from('releases')
    .upload(filePath, project, {
      contentType: 'application/zip',
    });

  console.debug('[service/upload]', data, error);
}
