import type {ProjectRelease} from 'types/project';

const config: ProjectRelease = {
  method: 'download',
  scope: 'document',
  docKey: '',
  apiKey: '',
  gitKey: '',
  gitRepo: '',
  gitBranch: '',
  includeAssets: true,
  includeTemplate: true,
  enableAssetOptimizations: true,
};

export default config;
