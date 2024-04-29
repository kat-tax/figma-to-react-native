import {fs} from '@zip.js/zip.js';
import {F2RN_EXO_REPO_ZIP} from 'config/env';

import type {ZipDirectoryEntry} from '@zip.js/zip.js';
import type {ProjectBuild, ProjectRelease, ProjectLinks} from 'types/project';

const PATH_DESIGN = 'design';
const PATH_GUIDES = 'guides';

export async function create(project: ProjectBuild, release: ProjectRelease) {
  // Import EXO
  const zip = new fs.FS();
  const src = 'https://corsproxy.io/?' + encodeURIComponent(F2RN_EXO_REPO_ZIP + '?_c=' + Math.random());
  const tpl = (await zip.importHttpContent(src))[0] as ZipDirectoryEntry;

  // Project info
  const font = 'Inter';
  const links: ProjectLinks = {
    documentation: 'https://exo.ult.dev',
    storybook: 'https://exo.fig.run',
    discord: 'https://discord.gg/KpMZVKmfnb',
    github: 'https://github.com/kat-tax/exo',
    figma: 'https://www.figma.com/file/DFmPlavFWyMaYJtoGLhGz3',
    x: 'https://twitter.com/theultdev',
  };

  // Rename EXO
  tpl.rename(project.name);
  zip.remove(tpl.getChildByName('package.json'));

  // Configure EXO
  configureMonorepo(tpl, links, font, release);
  configureStorybook(tpl, links, release);
  configureDocs(tpl);

  // Add project files
  tpl.addText(`${PATH_DESIGN}/index.ts`, project.index);
  tpl.addText(`${PATH_DESIGN}/theme.ts`, project.theme);

  // Add component files
  project.components.forEach(([name, index, code, story, docs]) => {
    const dir = tpl.addDirectory(`${PATH_DESIGN}/components/${name}`);
    if (index)
      dir.addText('index.ts', index);
    if (code)
      dir.addText(`${name}.tsx`, code);
    if (story)
      dir.addText(`${name}.story.tsx`, story);
    if (docs)
      dir.addText(`${name}.docs.mdx`, docs);
  });

  // Add asset files
  if (release.includeAssets) {
    project.assets.forEach(([name, isVector, bytes]) => {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'image/svg+xml' : 'image/png';
      const folder = isVector ? 'svg' : 'img';
      const blob = new Blob([bytes], {type});
      tpl.addBlob(`${PATH_DESIGN}/assets/${folder}/${name.toLowerCase()}.${ext}`, blob);
    });
  }

  // Export EXO
  return zip.exportBlob();
}

// Helpers

function configureMonorepo(
  tpl: ZipDirectoryEntry,
  link: ProjectLinks,
  font: string,
  release: ProjectRelease,
) {
  tpl.addText('config.yaml', templateAppConfig
    .replace('__NAME__', release.packageName || 'project')
    .replace('__FONT__', font)
    .replace('__PACKAGE__', release.packageName || 'react-exo')
    .replace('__PACKAGE_VERSION__', release.packageVersion || '0.0.1')
    .replace('__LINK_DOCS__', link.documentation)
    .replace('__LINK_STORYBOOK__', link.storybook)
    .replace('__LINK_DISCORD__', link.discord)
    .replace('__LINK_GITHUB__', link.github)
    .replace('__LINK_X__', link.x)
  );

  // TOOD: generate locales from variable collection
  tpl.addText('src/locales.ts', templateLocales);
}

function configureStorybook(
  tpl: ZipDirectoryEntry,
  links: ProjectLinks,
  release: ProjectRelease,
) {
  tpl.addText(`${PATH_GUIDES}/docs/styleguide/Get Started.mdx`, [
    `# ${release.packageName || 'project'}`,
    ``,
    `#### ${release.packageVersion || '0.0.1'}`,
    `- [Documentation](${links.documentation})`,
    `- [GitHub](${links.github})`,
    `- [Figma](${links.figma})`,
  ].join('\n'));
}

function configureDocs(
  tpl: ZipDirectoryEntry,
) {
  // Docs "getting started" page
  tpl.addText(
    `${PATH_GUIDES}/docs/developer/getting-started.mdx`,
    templateDocsHome
  );
}

// Templates

const templateAppConfig = `# General
APP_NAME: __NAME__
APP_DISPLAY_NAME: __NAME__

# State
STORE_VERSION: 1.0

# Design
FONT_NAME: __FONT__
FONT_WEIGHTS: 400,500

# Library
LIB_NAME: __PACKAGE__
LIB_VERSION: __PACKAGE_VERSION__

# Links
LINK_DOCS: __LINK_DOCS__
LINK_STORYBOOK: __LINK_STORYBOOK__
LINK_DISCORD: __LINK_DISCORD__
LINK_GITHUB: __LINK_GITHUB__
LINK_X: __LINK_X__

# Native
PACKAGE_IOS: com.exo.ios
PACKAGE_MACOS: com.exo.macos
PACKAGE_ANDROID: com.exo.android
PACKAGE_WINDOWS: com.exo.windows
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
