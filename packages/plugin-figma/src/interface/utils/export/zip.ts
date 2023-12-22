import {fs} from '@zip.js/zip.js';
import {F2RN_EXO_REPO_ZIP} from 'config/env';

import type {ZipDirectoryEntry} from '@zip.js/zip.js';
import type {ProjectBuild, ProjectConfig} from 'types/project';

export async function zip(project: ProjectBuild, config: ProjectConfig) {
  // Import exo repo
  const zip = new fs.FS();
  const src = 'https://corsproxy.io/?' + encodeURIComponent(F2RN_EXO_REPO_ZIP + '?_c=' + Math.random());
  const tpl = (await zip.importHttpContent(src))[0] as ZipDirectoryEntry;

  // Organize contents
  tpl.rename(project.name);
  zip.remove(tpl.getChildByName('package.json'));
  
  // Add root files
  tpl.addText('package.json', JSON.stringify({
    'name': config.method !== 'download' && config.packageName || `@kat.tax/exo`,
    'version': config.packageVersion || '0.0.1',
    'private': true,
    'scripts': {
      'dev': 'pnpm --filter ./apps/client run dev',
      'build': 'pnpm --filter ./apps/client run build',
      'storybook': 'pnpm --filter ./apps/storybook run dev',
      'storybook-build': 'pnpm --filter ./apps/storybook run build',
      'publish-ui': 'pnpm --filter ./packages/ui publish'
    }
  }, null, 2));

  // Add project files
  const cwd = `packages/ui`;
  tpl.addText(`${cwd}/index.ts`, project.index);
  tpl.addText(`${cwd}/theme.ts`, project.theme);

  // Add component files
  project.components.forEach(([name, index, code, story]) => {
    const dir = tpl.addDirectory(`${cwd}/components/${name}`);
    dir.addText('index.ts', index);
    dir.addText(`${name}.tsx`, code);
    dir.addText(`${name}.stories.tsx`, story);
  });

  // Add asset files
  if (config.includeAssets) {
    project.assets.forEach(([name, isVector, bytes]) => {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'image/svg+xml' : 'image/png';
      const folder = isVector ? 'svgs' : 'images';
      const blob = new Blob([bytes], {type});
      tpl.addBlob(`${cwd}/assets/${folder}/${name}.${ext}`, blob);
    });
  }

  // Export zip
  return zip.exportBlob();
}
