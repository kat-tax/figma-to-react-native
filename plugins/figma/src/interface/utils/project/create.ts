import {fs} from '@zip.js/zip.js';
import {F2RN_EXO_REPO_ZIP, F2RN_EXO_PROXY_URL} from 'config/consts';

import type {ZipDirectoryEntry} from '@zip.js/zip.js';
import type {ProjectBuild, ProjectInfo, ProjectRelease} from 'types/project';

export async function create(
  project: ProjectBuild,
  info: ProjectInfo,
  release: ProjectRelease,
) {
  // Debug
  console.log('[export]', project, info, release);
  
  // Import EXO
  const zip = new fs.FS();
  const src = F2RN_EXO_PROXY_URL + encodeURIComponent(F2RN_EXO_REPO_ZIP + '?_c=' + Math.random());
  const tpl = (await zip.importHttpContent(src))[0] as ZipDirectoryEntry;

  // Root
  tpl.rename('project');

  // Subfolders
  const guides = tpl.getChildByName('guides') as ZipDirectoryEntry;
  const design = tpl.getChildByName('design') as ZipDirectoryEntry;

  // Info
  const linkDocs = info.appConfig?.['Web']?.['DOCS']?.toString();
  const linkFigma = info.appConfig?.['Web']?.['FIGMA']?.toString();
  const linkGithub = info.appConfig?.['Web']?.['GITHUB']?.toString();
  const pkgVersion = info.appConfig?.['Design']?.['PACKAGE_VERSION']?.toString();
  const pkgName = info.appConfig?.['Design']?.['PACKAGE_NAME']?.toString();

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
  zip.remove(docs.getChildByName('start'));
  docs.addText('start/index.mdx', docIndexTemplate);

  // Storybook
  const sb = guides.getChildByName('storybook') as ZipDirectoryEntry;
  zip.remove(sb.getChildByName('get started.mdx'));
  sb.addText('get started.mdx', [
    `import {Meta} from \'@storybook/blocks\';`,
    ` `,
    `<Meta title="Get Started"/>`,
    ` `,
    `# ${pkgName || 'project'}`,
    ` `,
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

  // Design (custom lib name)
  // TODO: to finish support, replace package json files
  // that reference design package
  if (pkgName !== 'design') {
    zip.remove(design.getChildByName('env.d.ts'));
    zip.remove(design.getChildByName('package.json'));
    design.addText('env.d.ts', designEnv(pkgName));
    design.addText('package.json', JSON.stringify(
      {
        name: pkgName,
        version: pkgVersion,
        ...designPackageDefault,
      },
      null,
      2,
    ));
  }

  // Assets
  if (release.includeAssets) {
    const added = new Set();
    project.assets.forEach(([name, isVector, bytes]) => {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'svg' : 'img';
      const mime = isVector ? 'image/svg+xml' : 'image/png';
      const blob = new Blob([bytes], {type: mime});
      const path = `assets/${type}/${name.toLowerCase()}.${ext}`;
      if (added.has(path)) return;
      let category = design.getChildByName(`assets/${type}`);
      if (category) zip.remove(category);
      design.addBlob(path, blob);
      added.add(path);
    });
  }

  // Components
  project.components.forEach(([path, name, index, code, story, docs]) => {
    const component = design.addDirectory(path);
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

const designPackageDefault = {
  "type": "module",
  "scripts": {
    "dev": "conc -c 'auto' 'pnpm:*-dev'",
    "build": "conc -c 'auto' -g 'pnpm:*-build'",

    "web-dev": "vite dev  -c ../toolkit/bundler/gen/libs/design.web.js --port 6406",
    "web-build": "vite build -c ../toolkit/bundler/gen/libs/design.web.js",

    "native-dev": "vite dev  -c ../toolkit/bundler/gen/libs/design.native.js --port 6506",
    "native-build": "vite build -c ../toolkit/bundler/gen/libs/design.native.js"
  },
  "exports": {
    ".": {
      "types": "./gen/types/index.d.ts",
      "import": "./gen/web/index.js",
      "require": "./gen/native/index.js"
    },
    "./theme": {
      "types": "./gen/types/theme.d.ts",
      "import": "./gen/web/theme.js",
      "require": "./gen/native/theme.js"
    },
    "./styles": {
      "types": "./gen/types/styles.d.ts",
      "import": "./gen/web/styles.js",
      "require": "./gen/native/styles.js"
    },
    "./types": {
      "types": "./env.d.ts"
    }
  },
  "dependencies": {
    "@lingui/core": "^4.10.0",
    "@lingui/macro": "^4.10.0",
    "@lingui/react": "^4.10.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-exo": "workspace:*",
    "react-native": "^0.73.6",
    "react-native-svg": "^15.1.0",
    "react-native-unistyles": "^2.7.1",
    "react-native-web": "^0.19.10",
    "react-redux": "^9.1.2",
    "vite-plugin-node-polyfills": "^0.21.0"
  },
  "devDependencies": {
    "@storybook/blocks": "^8.0.10",
    "@storybook/react": "^8.0.8",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "bundler": "workspace:*",
    "config": "workspace:*",
    "typescript": "^5.3.2"
  }
}

const designEnv = (pkgName: string) => `import type {AppThemes, AppBreakpoints} from './styles';
import type {SvgProps} from 'react-native-svg';

declare module '${pkgName}/styles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

declare module 'design/styles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

declare module 'styles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

declare module '*.svg' {
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}
`;
