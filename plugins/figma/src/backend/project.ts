import {emit} from '@create-figma-plugin/utilities';
import {getComponentTargets} from 'backend/parser/lib';
import {generateBundle, generateIndex, generateTheme} from 'backend/generator';
import {F2RN_PROJECT_RELEASE} from 'config/env';
import {generateToken} from 'common/random';
import defaultReleaseConfig from 'config/release';
import * as config from 'backend/config';

import type {ProjectBuild, ProjectRelease, ProjectBuildAssets, ProjectBuildComponents} from 'types/project';
import type {EventProjectBuild, EventProjectConfigLoad} from 'types/events';
import type {ComponentAsset} from 'types/component';

export function build(release: ProjectRelease) {
  const user = figma.currentUser;

  // Send new project config to the interface to use
  emit<EventProjectConfigLoad>('PROJECT_CONFIG_LOAD', release);

  // Save submitted project config to the document
  // except for the method & scope, those should be ephemeral
  figma.root.setPluginData(F2RN_PROJECT_RELEASE, JSON.stringify({
    ...release,
    method: 'download',
    scope: 'document',
  } as ProjectRelease));

  // Determine which components to export
  let projectName: string = 'Components';
  let exportNodes: Set<ComponentNode> = new Set();
  switch (release.scope) {
    case 'document':
    case 'page':
      const useDoc = release.scope === 'document';
      const target = useDoc ? figma.root : figma.currentPage;
      projectName = useDoc ? figma.root.name : figma.currentPage.name;
      const targets = (target as ChildrenMixin)?.findAllWithCriteria({types: ['COMPONENT']});
      exportNodes = getComponentTargets(targets);
      break;
    case 'selected':
      exportNodes = getComponentTargets(figma.currentPage.selection);
      break;
  }

  // Export components, if any
  if (exportNodes.size > 0) {
    figma.notify(`Exporting ${exportNodes.size} component${exportNodes.size === 1 ? '' : 's'}…`, {timeout: 3500});
    setTimeout(async () => {
      const names = new Set<string>();
      const assets = new Map<string, ComponentAsset>();
      const buildAssets: ProjectBuildAssets = [];
      const components: ProjectBuildComponents = [];

      for await (const component of exportNodes) {
        try {
          const {bundle} = await generateBundle(component, config.state);
          if (bundle.code) {
            bundle.assets?.forEach(asset => assets.set(asset.hash, asset));
            components.push([bundle.name, bundle.index, bundle.code, bundle.story]);
            names.add(bundle.name);
            // console.log('[project/bundle]', bundle);
          }
        } catch (e) {
          console.error('Failed to export', component, e);
        }
      }

      assets.forEach(asset => buildAssets.push([
        asset.name,
        asset.isVector,
        asset.bytes,
      ]));

      const build: ProjectBuild = {
        components,
        time: Date.now(),
        name: projectName,
        index: generateIndex(names, config.state, true),
        theme: generateTheme(config.state).code,
        assets: buildAssets,
      };

      // console.log('[project/build]', build, projectConfig);

      emit<EventProjectBuild>('PROJECT_BUILD', build, release, user);
    }, 500);
  } else {
    emit<EventProjectBuild>('PROJECT_BUILD', null, release, user);
    figma.notify('No components found to export', {error: true});
  }
}

export function loadConfig() {
  let release: ProjectRelease;
  try {
    const rawConfig = figma.root.getPluginData(F2RN_PROJECT_RELEASE);
    const parsedConfig = JSON.parse(rawConfig);
    release = parsedConfig;
  } catch (e) {}
  const loadedConfig = release || defaultReleaseConfig;
  // If docKey is empty, generate one and save immediately
  if (!loadedConfig.docKey) {
    loadedConfig.docKey = generateToken(22);
    figma.root.setPluginData(F2RN_PROJECT_RELEASE, JSON.stringify(loadedConfig));
  }
  emit<EventProjectConfigLoad>('PROJECT_CONFIG_LOAD', loadedConfig);
}
