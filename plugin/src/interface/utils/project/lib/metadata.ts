import type {ProjectInfo} from 'types/project';

export interface ProjectMetadata {
  pkgName: string | undefined;
  pkgVersion: string | undefined;
}

export function metadata(info: ProjectInfo): ProjectMetadata {
  return {
    pkgName: info.appConfig?.General?.DESIGN_NAME?.toString(),
    pkgVersion: info.appConfig?.General?.DESIGN_VERSION?.toString(),
  };
}

export function appConfig(info: ProjectInfo): string {
  // Generate main config sections
  const configSections = Object.entries(info.appConfig)
    .map(([group, section]) =>
      `# ${group}\n${Object.entries(section).map(([key, value]) =>
        `${key}: ${value}`).join('\n')}`);
  // Generate translations section
  const translationsSection = [
    '# Translations',
    ...info.locales.all.map(([key, value]) => `LANG_${key.toUpperCase()}: ${value}`)
  ].join('\n');
  // Return combined sections
  return [
    ...configSections,
    translationsSection,
  ].join('\n\n');
}

export function packageJson(original: string, metadata: ProjectMetadata): string {
  const pkgConfig = JSON.parse(original);
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
