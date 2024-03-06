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
  configureMonorepo(tpl, release);
  configureStorybook(tpl, links, project, release);
  configureDocs(tpl, links, project, release);

  // Add project files
  const cwd = `libraries/ui`;
  tpl.addText(`${cwd}/index.ts`, project.index);
  tpl.addText(`${cwd}/theme.ts`, project.theme);

  // Add component files
  project.components.forEach(([name, index, code, story, docs]) => {
    const dir = tpl.addDirectory(`${cwd}/components/${name}`);
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
      const folder = isVector ? 'svgs' : 'images';
      const blob = new Blob([bytes], {type});
      tpl.addBlob(`${cwd}/assets/${folder}/${name.toLowerCase()}.${ext}`, blob);
    });
  }

  // Export EXO
  return zip.exportBlob();
}

// Helpers

function configureMonorepo(
  tpl: ZipDirectoryEntry,
  release: ProjectRelease,
) {
  tpl.addText('package.json', JSON.stringify({
    name: release.method !== 'download' && release.packageName || `project`,
    version: release.packageVersion || '0.0.1',
    private: true,
    scripts: {
      'start': 'concurrently pnpm:web pnpm:docs-dev pnpm:storybook-web',
      'build': 'concurrently pnpm:*-build',
      'web': 'pnpm --filter ./apps/client run dev',
      'web-build': 'pnpm --filter ./apps/client run build',
      'docs-dev': 'pnpm --filter ./apps/docs dev',
      'docs-build': 'pnpm --filter ./apps/docs build',
      'docs-preview': 'pnpm --filter ./apps/docs preview',
      'storybook-web': 'pnpm --filter ./apps/storybook/web run dev',
      'storybook-native': 'pnpm --filter ./apps/storybook/native run dev',
      'storybook-build': 'pnpm --filter ./apps/storybook/web run build',
      'publish-exo': 'pnpm --filter ./libraries/exo publish',
      'publish-ui': 'pnpm --filter ./libraries/ui publish',
    },
    'devDependencies': {
      'concurrently': '^8.2.2',
    },
  }, null, 2));
}

function configureStorybook(
  tpl: ZipDirectoryEntry,
  links: ProjectLinks,
  project: ProjectBuild,
  release: ProjectRelease,
) {
  tpl.addText('apps/storybook/web/.storybook/theme.ts', configStoryBookTheme.replace('__CONFIG__', JSON.stringify({
    brandTitle: project.name,
    fontBase: 'Inter, sans-serif',
    base: 'dark',
  }, null, 2)));
  
  tpl.addText('apps/storybook/common/pages/Get Started.mdx', [
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
  links: ProjectLinks,
  project: ProjectBuild,
  release: ProjectRelease,
) {
  tpl.addText('apps/docs/pages/index.mdx', configVocsLanding
    .replace('__PACKAGE__', release.packageName || 'project')
    .replace('__GITHUB__', links.github));

  tpl.addText('apps/docs/pages/getting-started.mdx', configVocsMainPage);

  tpl.addText('apps/docs/config/brand/general.ts', configVocsGeneral.replace('__CONFIG__', JSON.stringify({
    title: project.name,
    font: { 
      google: 'Inter',
    },
  }, null, 2)));

  tpl.addText('apps/docs/config/brand/theme.ts', configVocsTheme.replace('__CONFIG__', JSON.stringify({
    variables: {
      color: {
        background: { 
          light: 'white', 
          dark: 'black',
        },
      },
    }
  }, null, 2)));

  tpl.addText('apps/docs/config/brand/topNav.ts', configVocsTopNav.replace('__CONFIG__', JSON.stringify([
    {
      text: 'Storybook',
      link: links.storybook,
    },
    { 
      text: `v${release.packageVersion || '0.0.1'}`, 
      items: [
        { 
          text: 'Changelog', 
          link: `${links.github}/blob/master/CHANGELOG.md`, 
        },
        { 
          text: 'License', 
          link: `${links.github}/blob/master/LICENSE.md`, 
        }, 
      ],
    },
  ], null, 2)));

  tpl.addText('apps/docs/config/brand/socials.ts', configVocsSocials.replace('__CONFIG__', JSON.stringify([
    {icon: 'github', link: links.github},
    {icon: 'discord', link: links.discord},
    {icon: 'x', link: links.x},
  ], null, 2)));

  tpl.addText('apps/docs/config/sidebar/lib.ts', configVocsSideBar.replace('__CONFIG__', JSON.stringify([
    {
      text: 'Guides',
      collapsed: false,
      items: [
        {
          text: 'Getting Started',
          link: '/getting-started',
        },
      ],
    },
    {
      text: 'Components',
      collapsed: false,
      items: [
        {
          text: 'Base',
          items: [
            {
              text: 'Button',
              link: '/components/Button',
            },
            {
              text: 'Prompt',
              link: '/components/Prompt',
            },
            {
              text: 'InputText',
              link: '/components/InputText',
            },
            {
              text: 'InputEmail',
              link: '/components/InputEmail',
            },
          ],
        },
        {
          text: 'Form',
          items: [
            {
              text: 'Login',
              link: '/components/FormLogin',
            },
            {
              text: 'Signup',
              link: '/components/FormSignup',
            },
            {
              text: 'Validate Email',
              link: '/components/FormValidateEmail',
            },
            {
              text: 'Reset Password',
              link: '/components/FormResetPassword',
            },
          ],
        },
      ],
    },
  ], null, 2)));
}

// Templates

const configStoryBookTheme = `import {create} from '@storybook/theming/create';

export default create(__CONFIG__);
`;

const configVocsGeneral = `import type {Config} from 'vocs';

export default __CONFIG__ as Config;
`;

const configVocsTheme = `import type {Theme} from 'vocs';

export default __CONFIG__ as Theme;
`;

const configVocsTopNav = `import type {TopNavItem} from 'vocs';

export default __CONFIG__ as TopNavItem[];
`;

const configVocsSocials = `import type {SocialItem} from 'vocs';

export default __CONFIG__ as SocialItem[];
`;

const configVocsSideBar = `import type {SidebarItem} from 'vocs';

export default __CONFIG__ as SidebarItem[];
`;

const configVocsLanding = `---
layout: landing
---

import {HomePage} from 'vocs/components';

<HomePage.Root>
  <HomePage.Logo/>
  <HomePage.Tagline>
    Developer Documentation
  </HomePage.Tagline>
  <HomePage.InstallPackage name="__PACKAGE__" type="install"/>
  <HomePage.Buttons>
    <HomePage.Button href="/install" variant="accent">
      Get started
    </HomePage.Button>
    <HomePage.Button href="__GITHUB__">
      GitHub
    </HomePage.Button>
  </HomePage.Buttons>
</HomePage.Root>
`;

const configVocsMainPage = `# Getting Started

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
