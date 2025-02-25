import {git, http, MemoryFS} from 'git-mem';
import {F2RN_EXO_REPO_URL, F2RN_EXO_PROXY_URL} from 'config/consts';
import {DOC_INDEX_TEMPLATE} from './data/templates';
import * as _ from './data/metadata';

import type {ProjectBuild, ProjectInfo, ProjectRelease} from 'types/project';

export async function update(project: ProjectBuild, info: ProjectInfo, release: ProjectRelease) {
  const metadata = _.metadata(info);
  const corsProxy = `${F2RN_EXO_PROXY_URL}https:/`;
  const url = release.gitRepo || F2RN_EXO_REPO_URL;

  // Create memory file system
  const {fs} = MemoryFS();
  const dir = '/';
  const repo = {fs, dir};

  // Clone repository
  console.log('>>> Cloning repository');
  await git.clone({
    ...repo,
    ref: release.gitBranch || 'master',
    depth: 1,
    singleBranch: true,
    corsProxy,
    http,
    url,
  });

  // Checkout feature branch
  console.log('>>> Checking out feature branch');
  const ref = `release-${metadata.pkgVersion || '0.0.1'}`;
  await git.branch({...repo, ref, checkout: true});

  // Config
  console.log('>>> Writing config');
  fs.writeFileSync('config.yaml', _.appConfig(info));
  await git.add({fs, dir, filepath: 'config.yaml'});

  // Locales
  console.log('>>> Writing locales');
  fs.writeFileSync('locales.ts', _.localesConfig(info));
  await git.add({fs, dir, filepath: 'locales.ts'});

  // Docs
  console.log('>>> Writing docs');
  fs.writeFileSync('guides/docs/start/index.mdx', DOC_INDEX_TEMPLATE);
  await git.add({fs, dir, filepath: 'guides/docs/start/index.mdx'});

  // Storybook
  console.log('>>> Writing storybook');
  fs.writeFileSync(
    'guides/storybook/get started.mdx', 
    _.storybookIndex(metadata)
  );
  await git.add({fs, dir, filepath: 'guides/storybook/get started.mdx'});

  // Design
  console.log('>>> Writing design');
  fs.writeFileSync('design/index.ts', project.index);
  fs.writeFileSync('design/theme.ts', project.theme);
  await git.add({fs, dir, filepath: 'design/index.ts'});
  await git.add({fs, dir, filepath: 'design/theme.ts'});

  // Design (custom lib name)
  console.log('>>> Writing design (custom lib name)');
  if (metadata.pkgName !== 'design') {
    const pkgContent = fs.readFileSync('design/package.json', 'utf8');
    fs.writeFileSync(
      'design/package.json',
      _.packageJson(pkgContent.toString(), metadata)
    );
    await git.add({fs, dir, filepath: 'design/package.json'});
  }

  // Assets
  console.log('>>> Writing assets');
  if (release.includeAssets) {
    const added = new Set();
    for (const [name, isVector, bytes] of project.assets) {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'svg' : 'img';
      const path = `design/assets/${type}/${name.toLowerCase()}.${ext}`;
      if (added.has(path)) continue;
      fs.mkdirSync(`design/assets/${type}`, {recursive: true});
      fs.writeFileSync(path, bytes);
      added.add(path);
      await git.add({fs, dir, filepath: path});
    }
  }

  // Components
  console.log('>>> Writing components');
  for (const [path, name, index, code, story, docs] of project.components) {
    const fullPath = `design/${path}`;
    fs.mkdirSync(fullPath, {recursive: true});
    if (index) {
      fs.writeFileSync(`${fullPath}/index.ts`, index);
      await git.add({fs, dir, filepath: `${fullPath}/index.ts`});
    }
    if (code) {
      fs.writeFileSync(`${fullPath}/${name}.tsx`, code);
      await git.add({fs, dir, filepath: `${fullPath}/${name}.tsx`});
    }
    if (story) {
      fs.writeFileSync(`${fullPath}/${name}.story.tsx`, story);
      await git.add({fs, dir, filepath: `${fullPath}/${name}.story.tsx`});
    }
    if (docs) {
      fs.writeFileSync(`${fullPath}/${name}.docs.mdx`, docs);
      await git.add({fs, dir, filepath: `${fullPath}/${name}.docs.mdx`});
    }
  }

  // Commit
  console.log('>>> Committing changes');
  await git.commit({
    ...repo,
    author: {name: 'Figma Export', email: 'team@kat.tax'},
    message: `Release ${metadata.pkgVersion || '0.0.1'}`,
  });

  // Push changes
  console.log('>>> Pushing changes');
  await git.push({
    ...repo,
    ref,
    url,
    http,
    corsProxy,
    onAuth: () => ({username: release.gitKey}),
  });
}
