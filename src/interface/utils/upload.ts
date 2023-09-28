
import {zip} from './zip';
import {supabase} from 'vendor/supabase';

import type {ProjectBuild, ProjectConfig} from 'types/project';

export async function upload(project: ProjectBuild, config: ProjectConfig) {
  const contents = await zip(project);
  const folder = 'builds';
  const name = Date.now();
  const path = `${folder}/${name}.zip`;
  const {data, error} = await supabase
    .storage
    .from(config.apiKey)
    .upload(path, contents, {
      cacheControl: '3600',
      upsert: false,
    });

  console.debug('[upload]', data, error);
}
