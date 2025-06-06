import {fs} from '@zip.js/zip.js';
import {F2RN_EXO_REPO_ZIP, F2RN_EXO_PROXY_URL} from 'config/consts';
import {DOC_INDEX_TEMPLATE} from './data/templates';
import * as _ from './data/metadata';

import type {ZipDirectoryEntry, ZipFileEntry} from '@zip.js/zip.js';
import type {ProjectBuild, ProjectInfo, ProjectRelease} from 'types/project';

export async function create(
  project: ProjectBuild,
  info: ProjectInfo,
  release: ProjectRelease,
) {
  const metadata = _.metadata(info);
  
  // Import EXO
  const zip = new fs.FS();
  const src = F2RN_EXO_PROXY_URL + encodeURIComponent(`${F2RN_EXO_REPO_ZIP}?_c=${Math.random()}`);
  const tpl = (await zip.importHttpContent(src))[0] as ZipDirectoryEntry;

  // Root
  tpl.rename('project');

  // Subfolders
  const guides = tpl.getChildByName('guides') as ZipDirectoryEntry;
  const design = tpl.getChildByName('design') as ZipDirectoryEntry;

  // Config
  zip.remove(tpl.getChildByName('config.yaml'));
  tpl.addText('config.yaml', _.appConfig(info));

  // Locales
  zip.remove(tpl.getChildByName('locales.ts'));
  tpl.addText('locales.ts', _.localesConfig(info));

  // Docs
  const docs = guides.getChildByName('docs') as ZipDirectoryEntry;
  zip.remove(docs.getChildByName('start'));
  docs.addText('start/index.mdx', DOC_INDEX_TEMPLATE);

  // Storybook
  const sb = guides.getChildByName('storybook') as ZipDirectoryEntry;
  zip.remove(sb.getChildByName('get started.mdx'));
  sb.addText('get started.mdx', _.storybookIndex(metadata));

  // Design
  zip.remove(design.getChildByName('index.ts'));
  zip.remove(design.getChildByName('theme.ts'));
  design.addText('index.ts', project.index);
  design.addText('theme.ts', project.theme);

  // Design (custom lib name)
  if (metadata.pkgName !== 'design') {
    const pkgFile = design.getChildByName('package.json') as ZipFileEntry<string, string>;
    const pkgContent = await pkgFile.getText('utf-8');
    zip.remove(pkgFile);
    design.addText(
      'package.json',
      _.packageJson(pkgContent, metadata)
    );
  }

  // Assets
  if (release.includeAssets) {
    const added = new Set();
    for (const [name, isVector, bytes] of project.assets) {
      const ext = isVector ? 'svg' : 'png';
      const type = isVector ? 'svg' : 'img';
      const mime = isVector ? 'image/svg+xml' : 'image/png';
      const blob = new Blob([bytes], {type: mime});
      const path = `assets/${type}/${name.toLowerCase()}.${ext}`;
      if (added.has(path)) return;
      const category = design.getChildByName(`assets/${type}`);
      if (category) zip.remove(category);
      design.addBlob(path, blob);
      added.add(path);
    }
  }

  // Components
  for (const [path, name, index, code, story, docs] of project.components) {
    const component = design.addDirectory(path);
    if (index)
      component.addText('index.ts', index);
    if (code)
      component.addText(`${name}.tsx`, code);
    if (story)
      component.addText(`${name}.story.tsx`, story);
    if (docs)
      component.addText(`${name}.docs.mdx`, docs);
  }

  // Export
  return zip.exportBlob();
}
