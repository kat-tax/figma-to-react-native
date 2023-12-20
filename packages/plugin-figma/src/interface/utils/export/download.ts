import {zip} from './zip';

import type {ProjectBuild, ProjectConfig} from 'types/project';

export async function download(project: ProjectBuild, config: ProjectConfig) {
  const blob = await zip(project, config);
  const link = document.createElement('a');
  const src = URL.createObjectURL(blob);
  link.download = `${project.name}.zip`;
  link.href = src;
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(src), 3000);
}
