import supabase from 'interface/services/supabase';
import {zip} from './zip';

import type {ProjectBuild, ProjectRelease} from 'types/project';

export async function upload(build: ProjectBuild, release: ProjectRelease) {
  const contents = await zip(build, release);
  const pkg = release.packageName || '';
  const ver = release.packageVersion || '0.0.0';
  const counts = `${build.components.length}__${build.assets.length}`;
  const name = `${ver}__${counts}__${btoa(build.name)}__${btoa(pkg)}`;
  const path = `${release.apiKey}/${release.docKey}/${name}.zip`;
  const {data, error} = await supabase
    .storage
    .from('releases')
    .upload(path, contents, {
      contentType: 'application/zip',
    });
  console.debug('[service/upload]', data, error);
}
