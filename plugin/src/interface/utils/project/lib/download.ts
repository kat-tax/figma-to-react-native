import {create} from '../create';

import type {ProjectBuild, ProjectInfo, ProjectRelease} from 'types/project';

export async function download(project: ProjectBuild, info: ProjectInfo, release: ProjectRelease) {
  const blob = await create(project, info, release);
  const link = document.createElement('a');
  const src = URL.createObjectURL(blob);
  link.download = `${project.name}.zip`;
  link.href = src;
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(src), 3000);
}
