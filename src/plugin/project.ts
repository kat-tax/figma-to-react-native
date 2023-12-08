import {emit} from '@create-figma-plugin/utilities';
import {getComponentTargets} from 'plugin/fig/lib';
import {generateBundle, generateIndex, generateTheme} from 'plugin/gen';
import {F2RN_PROJECT_NS} from 'config/env';
import defaultConfig from 'config/project';
import * as config from 'plugin/config';

import type {ProjectBuild, ProjectConfig, ProjectBuildAssets, ProjectBuildComponents} from 'types/project';
import type {EventProjectBuild, EventProjectConfigLoad} from 'types/events';
import type {ComponentAsset} from 'types/component';

export function build(projectConfig: ProjectConfig) {
  const user = figma.currentUser;

  // Send new project config to the interface to use
  emit<EventProjectConfigLoad>('PROJECT_CONFIG_LOAD', projectConfig);

  // Save submitted project config to the document
  // except for the method & scope, those should be ephemeral
  figma.root.setPluginData(F2RN_PROJECT_NS, JSON.stringify({
    ...projectConfig,
    method: 'download',
    scope: 'document',
  } as ProjectConfig));

  // Determine which components to export
  let projectName: string = 'Components';
  let exportNodes: Set<ComponentNode> = new Set();
  switch (projectConfig.scope) {
    case 'document':
    case 'page':
      const useDoc = projectConfig.scope === 'document';
      const target = useDoc ? figma.root : figma.currentPage;
      projectName = useDoc ? figma.root.name : figma.currentPage.name;
      exportNodes = getComponentTargets(target.findAllWithCriteria({types: ['COMPONENT']}));
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
        name: projectName,
        id: projectConfig.docKey,
        index: generateIndex(names, config.state, true),
        theme: generateTheme(config.state).code,
        assets: buildAssets,
      };

      // console.log('[project/build]', build, projectConfig);

      emit<EventProjectBuild>('PROJECT_BUILD', build, projectConfig, user);
    }, 500);
  } else {
    figma.notify('No components found to export', {error: true});
  }
}

export function loadConfig() {
  let config: ProjectConfig;
  try {
    const rawConfig = figma.root.getPluginData(F2RN_PROJECT_NS);
    const parsedConfig = JSON.parse(rawConfig);
    config = parsedConfig;
  } catch (e) {}
  
  emit<EventProjectConfigLoad>('PROJECT_CONFIG_LOAD', config || defaultConfig);
}
