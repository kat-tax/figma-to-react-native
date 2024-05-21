// TODO:
// - fix component folders (lowercase + use sections for categories)

import {fs} from '@zip.js/zip.js';
import {F2RN_EXO_REPO_ZIP} from 'config/env';

import type {ZipDirectoryEntry} from '@zip.js/zip.js';
import type {ProjectBuild, ProjectInfo, ProjectRelease} from 'types/project';

export async function create(project: ProjectBuild, info: ProjectInfo, release: ProjectRelease) {
  // Debug
  console.log('export', project, info, release);
  
  // Import EXO
  const zip = new fs.FS();
  const src = 'https://corsproxy.io/?' + encodeURIComponent(F2RN_EXO_REPO_ZIP + '?_c=' + Math.random());
  const tpl = (await zip.importHttpContent(src))[0] as ZipDirectoryEntry;

  // Root
  tpl.rename(project.name);

  // Subfolders
  const guides = tpl.getChildByName('guides') as ZipDirectoryEntry;
  const design = tpl.getChildByName('design') as ZipDirectoryEntry;
  const assets = design.getChildByName('assets') as ZipDirectoryEntry;
  const components = design.getChildByName('components') as ZipDirectoryEntry;

  // Info
  const linkDocs = info.appConfig?.['Web']?.['DOCS']?.toString();
  const linkGithub = info.appConfig?.['Web']?.['GITHUB']?.toString();
  const linkFigma = info.appConfig?.['Web']?.['FIGMA']?.toString();
  const pkgName = info.appConfig?.['Library']?.['PACKAGE_NAME']?.toString();
  const pkgVersion = info.appConfig?.['Library']?.['PACKAGE_VERSION']?.toString();

  // Config
  zip.remove(tpl.getChildByName('config.yaml'));
  tpl.addText('config.yaml', Object.entries(info.appConfig)
  .map(([group, section]) => `# ${group}\n` + Object.entries(section)
    .map(([key, value]) => `${key}: ${value}`).join('\n'))
  .join('\n\n'));

  // Locales
  zip.remove(tpl.getChildByName('locales.ts'));
  tpl.addText('locales.ts', [
    `/** Supported languages **/`,
    ``,
    `export type Locales = keyof typeof locales;`,
    `export const sourceLocale: Locales = "${info.locales.source}";`,
    `export const locales = ${JSON.stringify(info.locales.all.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {}), null, 2)} as const;`,
   ].join('\n'));

  // Docs
  const docs = guides.getChildByName('docs') as ZipDirectoryEntry;
  docs.children.forEach(child => zip.remove(child));
  docs.addText('start/index.mdx', docIndexTemplate);

  // Storybook
  const sb = guides.getChildByName('storybook') as ZipDirectoryEntry;
  zip.remove(sb.getChildByName('get started.mdx'));
  sb.addText('get started.mdx', [
    `# ${pkgName || 'project'}`,
    ``,
    `#### ${pkgVersion || '0.0.1'}`,
    linkDocs && `- [Documentation](${linkDocs})`,
    linkGithub && `- [GitHub](${linkGithub})`,
    linkFigma && `- [Figma](${linkFigma})`,
  ].filter(Boolean).join('\n'));

  // Design
  zip.remove(design.getChildByName('index.ts'));
  zip.remove(design.getChildByName('theme.ts'));
  design.addText('index.ts', project.index);
  design.addText('theme.ts', project.theme);

  // Assets
  if (release.includeAssets) {
    const added = new Set();
    project.assets.forEach(([name, isVector, bytes]) => {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'svg' : 'img';
      const mime = isVector ? 'image/svg+xml' : 'image/png';
      const blob = new Blob([bytes], {type: mime});
      const path = `${type}/${name.toLowerCase()}.${ext}`;
      if (added.has(path)) return;
      let category = assets.getChildByName(type) as ZipDirectoryEntry;
      if (category) zip.remove(category);
      assets.addBlob(path, blob);
      added.add(path);
    });
  }

  // Components
  project.components.forEach(([name, index, code, story, docs]) => {
    const component = components.addDirectory(name);
    if (index)
      component.addText('index.ts', index);
    if (code)
      component.addText(`${name}.tsx`, code);
    if (story)
      component.addText(`${name}.story.tsx`, story);
    if (docs)
      component.addText(`${name}.docs.mdx`, docs);
  });

  // Export
  return zip.exportBlob();
}

const docIndexTemplate = `# Getting Started

::::steps

### Install Dependencies

:::code-group

\`\`\`bash [npm]
npm install
\`\`\`

\`\`\`bash [pnpm]
pnpm install
\`\`\`

\`\`\`bash [yarn]
yarn install
\`\`\`

\`\`\`bash [bun]
bun install
\`\`\`

:::

### Run Development Servers

:::code-group

\`\`\`bash [npm]
npm start
\`\`\`

\`\`\`bash [pnpm]
pnpm start
\`\`\`

\`\`\`bash [yarn]
yarn start
\`\`\`

\`\`\`bash [bun]
bun start
\`\`\`

:::

:::info
You may now access the following dev servers:
- **Native**: *connect a device or simulator to Metro*
- **Web**: http://localhost:6206
- **Docs**: http://localhost:6106
- **Storybook**: http://localhost:6006
:::
`;
