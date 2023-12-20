import {fs} from '@zip.js/zip.js';
import {F2RN_EXPORT_TPL} from 'config/env';

import type {ProjectBuild, ProjectConfig} from 'types/project';

export async function zip(project: ProjectBuild, config: ProjectConfig) {
  // Import template
  const zip = new fs.FS();
  const src = 'https://corsproxy.io/?' + encodeURIComponent(F2RN_EXPORT_TPL + '?_c=' + Math.random());
  const tpl = (await zip.importHttpContent(src))[0];

  // Project info
  const [org, pkg] = config.packageName?.split('/') || ['@f2rn', 'ui'];

  // Reorganize
  zip.move(tpl, zip.addDirectory('packages'));
  tpl.rename(pkg);

  // Add root files
  zip.addText('.gitignore', `# OSX\n.DS_Store\n\n# Node\nnode_modules/\n`);
  zip.addText('pnpm-workspace.yaml', `packages:\n  - 'packages/*'\n  - '!**/test/**'`);
  zip.addText('package.json', JSON.stringify({
    name: `${org}/monorepo`,
    private: true,
    version: config.packageVersion || '0.0.0',
    workspaces: ['packages/*'],
  }, null, 2));

  // Add project files
  const cwd = `${tpl.getFullname()}/src`;
  zip.addText(`${cwd}/index.ts`, project.index);
  zip.addText(`${cwd}/theme.ts`, project.theme);

  // Add component files
  project.components.forEach(([name, index, code, story]) => {
    const dir = zip.addDirectory(`${cwd}/components/${name}`);
    dir.addText('index.ts', index);
    dir.addText(`${name}.tsx`, code);
    dir.addText(`${name}.stories.tsx`, story);
  });

  // Add asset files
  if (config.includeAssets) {
    project.assets.forEach(([name, isVector, bytes]) => {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'image/svg+xml' : 'image/png';
      const folder = isVector ? 'vectors' : 'images';
      const blob = new Blob([bytes], {type});
      zip.addBlob(`${cwd}/assets/${folder}/${name}.${ext}`, blob);
    });
  }

  // Export zip
  return zip.exportBlob();
}
