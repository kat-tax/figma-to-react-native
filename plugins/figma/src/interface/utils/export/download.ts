import {zip} from './zip';

import type {ProjectBuild, ProjectRelease} from 'types/project';

export async function download(project: ProjectBuild, release: ProjectRelease) {
  const blob = await zip(project, release);
  const link = document.createElement('a');
  const src = URL.createObjectURL(blob);
  link.download = `${project.name}.zip`;
  link.href = src;
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(src), 3000);
}
