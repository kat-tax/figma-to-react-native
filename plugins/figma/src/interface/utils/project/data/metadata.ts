import type {ProjectInfo} from 'types/project';

export interface ProjectMetadata {
  linkDocs: string | undefined;
  linkFigma: string | undefined;
  linkGithub: string | undefined;
  pkgVersion: string | undefined;
  pkgName: string | undefined;
}

export function metadata(info: ProjectInfo): ProjectMetadata {
  return {
    linkDocs: info.appConfig?.Web?.DOCS?.toString(),
    linkFigma: info.appConfig?.Web?.FIGMA?.toString(),
    linkGithub: info.appConfig?.Web?.GITHUB?.toString(),
    pkgVersion: info.appConfig?.Design?.PACKAGE_VERSION?.toString(),
    pkgName: info.appConfig?.Design?.PACKAGE_NAME?.toString(),
  };
}

export function appConfig(info: ProjectInfo): string {
  return Object.entries(info.appConfig)
    .map(([group, section]) =>
      `# ${group}\n ${Object.entries(section).map(([key, value]) =>
        `${key}: ${value}`).join('\n')}`).join('\n\n');
}

export function localesConfig(info: ProjectInfo): string {
  return [
    '/** Supported languages **/',
    '',
    'export type Locales = keyof typeof locales;',
    `export const sourceLocale: Locales = "${info.locales.source}";`,
    `export const locales = ${JSON.stringify(info.locales.all.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {}), null, 2)} as const;`,
  ].join('\n');
}

export function storybookIndex(metadata: ProjectMetadata): string {
  const {linkDocs, linkGithub, linkFigma, pkgName, pkgVersion} = metadata;
  return [
    `import {Meta} from \'@storybook/blocks\';`,
    '',
    `<Meta title="Get Started"/>`,
    '',
    `# ${pkgName || 'project'}`,
    '',
    `#### ${pkgVersion || '0.0.1'}`,
    [
      linkDocs && `- [Documentation](${linkDocs})`,
      linkGithub && `- [GitHub](${linkGithub})`,
      linkFigma && `- [Figma](${linkFigma})`,
    ].filter(Boolean).join('\n'),
  ].join('\n');
}

export function packageJson(
  originalContent: string,
  metadata: ProjectMetadata
): string {
  const pkgConfig = JSON.parse(originalContent);
  return JSON.stringify(
    {
      ...pkgConfig,
      name: metadata.pkgName,
      version: metadata.pkgVersion,
    },
    null,
    2
  ) + '\n';
}
