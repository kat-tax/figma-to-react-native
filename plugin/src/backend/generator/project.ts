import {emit} from '@create-figma-plugin/utilities';

import * as string from 'common/string';
import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';

import {generateBundle} from './lib/generateBundle';
import {generateIndex} from './lib/generateIndex';
import {generateTheme} from './lib/generateTheme';

import type {ProjectBuild, ProjectInfo, ProjectBuildAssets, ProjectBuildComponents, ProjectExport} from 'types/project';
import type {ComponentInfo, ComponentAsset} from 'types/component';
import type {EventProjectRelease} from 'types/events';
import type {ProjectSettings} from 'types/settings';

export function build(form: ProjectExport, settings: ProjectSettings) {
  // Get info
  const user = figma.currentUser;
  const target = figma.root;
  const projectName = target.name;
  const componentNodes = (target as unknown as ChildrenMixin)?.findAllWithCriteria({types: ['COMPONENT']});
  const exportNodes = parser.getComponentTargets(componentNodes);

  // Filter out special pages
  exportNodes.forEach(node => {
      const pageName = parser.getPage(node).name;
      if (pageName === consts.PAGES_SPECIAL.TESTS
        || pageName === consts.PAGES_SPECIAL.LIBRARY
        || pageName === consts.PAGES_SPECIAL.ICONS
        || pageName === consts.PAGES_SPECIAL.NAVIGATION) {
        exportNodes.delete(node);
      }
  });

  // Export components, if any
  let projectVersion = '';
  if (exportNodes.size > 0) {
    figma.notify(`Exporting ${exportNodes.size} component${exportNodes.size === 1 ? '' : 's'}…`, {timeout: 3500});
    setTimeout(async () => {
      // Generate components
      const components: ProjectBuildComponents = [];
      const buildAssets: ProjectBuildAssets = [];
      const componentInfo: Record<string, ComponentInfo> = {};
      const assets = new Map<string, ComponentAsset>();
      for (const component of exportNodes) {
        try {
          const bundle = await generateBundle(component, null, settings);
          if (bundle.code) {
            bundle.assets?.forEach(asset => assets.set(asset.hash, asset));
            componentInfo[bundle.info.target.key] = bundle.info;
            components.push([
              bundle.info.path,
              bundle.info.name,
              bundle.index,
              bundle.code,
              bundle.story,
              bundle.docs,
            ]);
            // console.log('>> [project/bundle]', bundle);
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

      const [collectionConfig, collectionLocales] = await Promise.all([
        parser.getVariableCollection(consts.VARIABLE_COLLECTIONS.APP_CONFIG),
        parser.getVariableCollection(consts.VARIABLE_COLLECTIONS.LOCALES),
      ]);

      const [varsConfig, varsLocales] = await Promise.all([
        parser.getVariables(collectionConfig?.variableIds),
        parser.getVariables(collectionLocales?.variableIds),
      ]);

      const info: ProjectInfo = {
        appConfig: getAppConfig(collectionConfig, varsConfig),
        locales: getLocales(collectionLocales, varsLocales),
      };

      // Increment design package version
      if (form.method === 'npm' || form.method === 'git') {
        const version = info.appConfig?.['Design']?.['PACKAGE_VERSION']?.toString();
        if (version) {
          const [major, minor, patch] = version.split('.').map(Number);
          const newVersion = `${major}.${minor}.${patch + 1}`;
          projectVersion = newVersion;
          info.appConfig['Design']['PACKAGE_VERSION'] = newVersion;
        }
        await setProjectVersion(projectVersion);
      }

      const build: ProjectBuild = {
        components,
        time: Date.now(),
        name: projectName,
        index: generateIndex(Object.values(componentInfo), settings, true),
        theme: (await generateTheme(settings)).themes.code,
        assets: buildAssets,
      };

      // console.log('>> [project/build]', build, info);
      emit<EventProjectRelease>('PROJECT_RELEASE', info, build, settings, form, user);
    }, 500);
  } else {
    emit<EventProjectRelease>('PROJECT_RELEASE', null, null, settings, form, user);
    figma.notify('No components found to export', {error: true});
    if (projectVersion) {
      setProjectVersion(projectVersion);
    }
  }
}

function getAppConfig(
  collection: VariableCollection,
  variables: Variable[],
): ProjectInfo['appConfig'] {
  return variables.reduce((acc, cur) => {
    const defaultMode = collection.defaultModeId;
    const defaultValue = cur.valuesByMode[defaultMode]?.toString().trim();
    const [_group, _key] = cur.name.includes('/') ? cur.name.split('/') : ['General', cur.name];
    const group = string.titleCase(_group);
    const key = string.createIdentifierConstant(_key);
    const val = key.startsWith('@') ? `"${defaultValue}"` : defaultValue;
    if (!acc[group]) acc[group] = {};
    acc[group][key] = val;
    return acc;
  }, {} as ProjectInfo['appConfig']);
}

function getLocales(
  collection?: VariableCollection,
  variables?: Variable[],
): ProjectInfo['locales'] {
  // No locales collection or variable
  if (!collection || !variables) return {
    source: 'en',
    all: [['en', 'English']],
  };
  // Default source locale is first in the collection
  const mode = collection.defaultModeId;
  const source = variables[0]?.valuesByMode[mode]?.toString().trim();
  // Add all locales from the collection to the list
  const all = variables.map(v => {
    const value = v.valuesByMode[mode]?.toString().trim();
    return [value, v.name] as [string, string];
  });
  return {source, all};
}

async function setProjectVersion(version: string) {
  const config = await parser.getVariableCollection(consts.VARIABLE_COLLECTIONS.APP_CONFIG);
  if (config) {
    const variables = await parser.getVariables(config.variableIds);
    if (variables) {
      const variable = variables.find(v => v.name === 'Design/Package Version');
      if (variable) {
        variable.setValueForMode(config.defaultModeId, version);
      }
    }
  }
}

