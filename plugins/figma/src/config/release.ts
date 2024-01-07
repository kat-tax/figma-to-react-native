import type {ProjectRelease} from 'types/project';

const config: ProjectRelease = {
  method: 'download',
  scope: 'document',
  docKey: '',
  apiKey: '',
  packageName: '',
  packageVersion: '',
  includeAssets: true,
  enableAssetOptimizations: false,
  enableAutoTranslations: false,
};

export default config;
