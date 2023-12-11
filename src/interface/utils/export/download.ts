import {zip} from './zip';

import type {ProjectBuild} from 'types/project';

export async function download(project: ProjectBuild) {
  const blob = await zip(project);
  const link = document.createElement('a');
  const src = URL.createObjectURL(blob);
  link.href = src;
  link.download = `${project.name}.zip`;
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(src), 1000);
}
