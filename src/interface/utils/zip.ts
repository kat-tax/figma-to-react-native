import {downloadZip} from 'client-zip';

import type {ProjectBuild} from 'types/project';

const UNISTYLES_LIB = `import {createUnistyles} from 'react-native-unistyles';
import theme, {breakpoints} from './theme';

export const {createStyleSheet, useStyles} = createUnistyles<
  typeof breakpoints,
  typeof theme
>(breakpoints);
`;

export async function zip(project: ProjectBuild) {
  const lastModified = new Date();
  const payload: Array<{
    name: string,
    lastModified: Date,
    input: string | Uint8Array,
  }> = [];
  payload.push({name: 'index.ts', lastModified, input: project.index});
  payload.push({name: 'theme.ts', lastModified, input: project.theme});
  payload.push({name: 'styles.ts', lastModified, input: UNISTYLES_LIB});
  project.components.forEach(([name, index, code, story]) => {
    payload.push({name: `components/${name}/index.ts`, lastModified, input: index});
    payload.push({name: `components/${name}/${name}.tsx`, lastModified, input: code});
    payload.push({name: `components/${name}/${name}.stories.tsx`, lastModified, input: story});
  });
  project.assets.forEach(([name, isVector, bytes]) => {
    const folder = isVector ? 'vectors' : 'rasters';
    const extension = isVector ? 'svg' : 'png';
    payload.push({
      name: `assets/${folder}/${name}.${extension}`,
      input: bytes,
      lastModified,
    });
  });
  return await downloadZip(payload).blob();
}
