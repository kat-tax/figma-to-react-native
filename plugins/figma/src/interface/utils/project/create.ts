import {fs} from '@zip.js/zip.js';
import {F2RN_EXO_REPO_ZIP} from 'config/env';

import type {ZipDirectoryEntry} from '@zip.js/zip.js';
import type {ProjectBuild, ProjectRelease, ProjectLinks} from 'types/project';

export async function create(project: ProjectBuild, release: ProjectRelease) {
  // Import EXO
  const zip = new fs.FS();
  const src = 'https://corsproxy.io/?' + encodeURIComponent(F2RN_EXO_REPO_ZIP + '?_c=' + Math.random());
  const tpl = (await zip.importHttpContent(src))[0] as ZipDirectoryEntry;

  // Project info
  // TODO: use variable collection "App Config" values instead of hardcoding
  const font = 'Inter';
  const links: ProjectLinks = {
    documentation: 'https://exo.ult.dev',
    storybook: 'https://exo.fig.run',
    discord: 'https://discord.gg/KpMZVKmfnb',
    github: 'https://github.com/kat-tax/exo',
    x: 'https://twitter.com/theultdev',
  };

  // Root
  tpl.rename(project.name);

  // Subfolders
  const guides = tpl.getChildByName('guides') as ZipDirectoryEntry;
  const design = tpl.getChildByName('design') as ZipDirectoryEntry;
  const assets = design.getChildByName('assets') as ZipDirectoryEntry;
  const components = design.getChildByName('components') as ZipDirectoryEntry;

  // Config
  zip.remove(tpl.getChildByName('config.yaml'));
  tpl.addText('config.yaml', templateAppConfig
    .replace('__NAME__', release.packageName || 'project')
    .replace('__DISPLAY_NAME__', release.packageName || 'Project')
    .replace('__FONT__', font)
    .replace('__PACKAGE__', release.packageName || 'react-exo')
    .replace('__PACKAGE_VERSION__', release.packageVersion || '0.0.1')
    .replace('__LINK_DOCS__', links.documentation)
    .replace('__LINK_STORYBOOK__', links.storybook)
    .replace('__LINK_DISCORD__', links.discord)
    .replace('__LINK_GITHUB__', links.github)
    .replace('__LINK_X__', links.x)
  );

  // Locales
  zip.remove(tpl.getChildByName('locales.ts'));
  tpl.addText('locales.ts', templateLocales);

  // Docs
  /*const docs = guides.getChildByName('docs') as ZipDirectoryEntry;
  zip.remove(docs.getChildByName('getting-started.mdx'));
  docs.addText('getting-started.mdx', templateDocsHome);

  // Storybook
  const sb = guides.getChildByName('storybook') as ZipDirectoryEntry;
  zip.remove(sb.getChildByName('Get Started.mdx'));
  sb.addText('Get Started.mdx', [
    `# ${release.packageName || 'project'}`,
    ``,
    `#### ${release.packageVersion || '0.0.1'}`,
    `- [Documentation](${links.documentation})`,
    `- [GitHub](${links.github})`,
    `- [Figma](${links.figma})`,
  ].join('\n'));*/

  // Design
  zip.remove(design.getChildByName('index.ts'));
  zip.remove(design.getChildByName('theme.ts'));
  design.addText('index.ts', project.index);
  design.addText('theme.ts', project.theme);

  // Assets
  /*if (release.includeAssets) {
    project.assets.forEach(([name, isVector, bytes]) => {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'svg' : 'img';
      const mime = isVector ? 'image/svg+xml' : 'image/png';
      const blob = new Blob([bytes], {type: mime});
      let category = assets.getChildByName(type) as ZipDirectoryEntry;
      if (category) zip.remove(category);
      else category = assets.addDirectory(type);
      category.addBlob(`${name.toLowerCase()}.${ext}`, blob);
    });
  }*/

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

// Templates

const templateAppConfig = `# General
APP_NAME: __APP_NAME__
APP_DISPLAY_NAME: __APP_DISPLAY_NAME__

# Design
FONT_NAME: __FONT_NAME__

# State
STORE_VERSION: __STORE_VERSION__

# Library
LIB_NAME: __LIB_NAME__
LIB_VERSION: __LIB_VERSION__

# Web
LINK_DOCS: __LINK_DOCS__
LINK_STORYBOOK: __LINK_STORYBOOK__
LINK_DISCORD: __LINK_DISCORD__
LINK_GITHUB: __LINK_GITHUB__
LINK_X: __LINK_X__

# Native
PACKAGE_IOS: __PACKAGE_IOS__
PACKAGE_MACOS: __PACKAGE_MACOS__
PACKAGE_ANDROID: __PACKAGE_ANDROID__
PACKAGE_WINDOWS: __PACKAGE_WINDOWS__
`;

const templateLocales = `/** Supported languages **/

export type Locales = keyof typeof locales;

export const sourceLocale: Locales = 'en';
export const locales = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Portugués',
  ja: 'Bahasa Indonesia',
  ru: 'Русский',
  ar: 'やまと',
  id: 'عربي',
} as const;
`;

const templateDocsHome = `# Getting Started

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
