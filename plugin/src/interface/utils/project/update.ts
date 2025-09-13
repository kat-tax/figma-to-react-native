// TODO: use git provider to avoid re-cloning
// only switch over when sure it clears last release
// and uses latest project data

import {git, http, MemoryFS} from 'git-mem';
import {F2RN_EXO_REPO_URL, F2RN_EXO_PROXY_URL} from 'config/consts';
import {emit} from '@create-figma-plugin/utilities';
import * as _ from './lib/metadata';

import type {ProjectBuild, ProjectInfo} from 'types/project';
import type {ProjectSettings} from 'types/settings';
import type {EventNotify} from 'types/events';

export async function update(project: ProjectBuild, info: ProjectInfo, settings: ProjectSettings) {
  const metadata = _.metadata(info);
  const corsProxy = `${F2RN_EXO_PROXY_URL}https:/`;
  const username = settings.git.accessToken;
  const branch = settings.git.branch || 'master';
  const url = settings.git.repo || F2RN_EXO_REPO_URL;

  // Create memory file system
  const {fs} = MemoryFS();
  const dir = '/';
  const repo = {fs, dir};
  const changes = new Set<string>();

  // Clone repository
  await git.clone({...repo, ref: branch, url, singleBranch: true, depth: 1, corsProxy, http, onAuth: () => ({username})});

  // Checkout feature branch
  const ref = `design-${metadata.pkgVersion || '0.0.1'}`;
  await git.branch({...repo, ref, checkout: true});

  // Config
  fs.writeFileSync('config.yaml', _.appConfig(info));
  changes.add('config.yaml');

  // Design
  fs.writeFileSync('design/index.ts', project.index);
  fs.writeFileSync('design/theme.ts', project.theme);
  changes.add('design/index.ts');
  changes.add('design/theme.ts');

  // Design (custom lib name)
  if (metadata.pkgName !== 'design') {
    const pkg = fs.readFileSync('design/package.json', 'utf8');
    fs.writeFileSync('design/package.json', _.packageJson(pkg.toString(), metadata));
    changes.add('design/package.json');
  }

  // Assets
  const added = new Set();
  for (const [path, name, isVector, bytes] of project.assets) {
    const ext = isVector ? 'svg' : 'png';
    const base = `design/${path}/assets`;
    const filePath = `${base}/${name.toLowerCase()}.${ext}`;
    if (added.has(path)) continue;
    fs.mkdirSync(base, {recursive: true});
    fs.writeFileSync(filePath, bytes);
    added.add(filePath);
    changes.add(filePath);
  }

  // Components
  for (const [path, name, index, code, story, docs] of project.components) {
    const fullPath = `design/${path}`;
    fs.mkdirSync(fullPath, {recursive: true});
    if (index) {
      fs.writeFileSync(`${fullPath}/index.ts`, index);
      changes.add(`${fullPath}/index.ts`);
    }
    if (code) {
      fs.writeFileSync(`${fullPath}/${name}.tsx`, code);
      changes.add(`${fullPath}/${name}.tsx`);
    }
    if (story) {
      fs.writeFileSync(`${fullPath}/${name}.story.tsx`, story);
      changes.add(`${fullPath}/${name}.story.tsx`);
    }
    if (docs) {
      fs.writeFileSync(`${fullPath}/${name}.docs.mdx`, docs);
      changes.add(`${fullPath}/${name}.docs.mdx`);
    }
  }

  // Commit
  const message = `Release ${metadata.pkgVersion || '0.0.1'}`;
  await git.add({fs, dir, parallel: true, filepath: Array.from(changes)});
  await git.commit({...repo, message, author: {name: 'Figma → React Native', email: 'team@kat.tax'}});

  // Push changes
  let error: Error | null = null;
  try {
    const res = await git.push({...repo, ref, url, http, corsProxy, onAuth: () => ({username})});
    if (!res.ok) error = new Error(res.error ?? 'Unknown git export error');
  } catch (e) {
    error = e as Error;
  }

  // Failure
  if (error) {
    emit<EventNotify>('NOTIFY', `Git: ${error.message}`, {error: true});
    throw error;
  }

  // Success
  emit<EventNotify>('NOTIFY', 'Changes pushed.', {
    button: ['View Branch', `${settings.git.repo}/compare/${ref}?expand=1`],
    timeout: 10000,
  });
}
