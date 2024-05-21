import {emit} from '@create-figma-plugin/utilities';
import {VARIABLE_COLLECTIONS} from 'backend/generator/lib/consts';
import {createIdentifierConstant, titleCase} from 'common/string';
import {generateToken} from 'common/random';
import defaultReleaseConfig from 'config/release';
import {F2RN_PROJECT_RELEASE} from 'config/env';
import * as config from 'backend/utils/config';
import * as parser from 'backend/parser/lib';

import {bundle as generateBundle} from './service';
import {generateIndex} from './lib/generateIndex';
import {generateTheme} from './lib/generateTheme';

import type {ProjectBuild, ProjectInfo, ProjectRelease, ProjectBuildAssets, ProjectBuildComponents} from 'types/project';
import type {EventProjectBuild, EventProjectConfigLoad} from 'types/events';
import type {ComponentAsset} from 'types/component';
import type {VariableModes} from 'types/figma';

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
      exportNodes = parser.getComponentTargets(targets);
      break;
    case 'selected':
      exportNodes = parser.getComponentTargets(figma.currentPage.selection);
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
            components.push([bundle.name, bundle.index, bundle.code, bundle.story, bundle.docs]);
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

      const [collectionConfig, collectionLocales] = await Promise.all([
        parser.getVariableCollection(VARIABLE_COLLECTIONS.APP_CONFIG),
        parser.getVariableCollection(VARIABLE_COLLECTIONS.LOCALES),
      ]);

      const [varsConfig, varsTranslations, modesLocales] = await Promise.all([
        parser.getVariables(collectionConfig.variableIds),
        parser.getVariables(collectionLocales.variableIds),
        parser.getVariableCollectionModes(collectionLocales),
      ]);
      
      const info: ProjectInfo = {
        appConfig: getAppConfig(collectionConfig, varsConfig),
        locales: getLocales(modesLocales),
        translations: getTranslations(collectionLocales, varsTranslations, modesLocales),
      };

      const build: ProjectBuild = {
        components,
        time: Date.now(),
        name: projectName,
        index: generateIndex(names, config.state, true),
        theme: (await generateTheme(config.state)).themes.code,
        assets: buildAssets,
      };

      // console.log('[project/build]', build, projectConfig);
      emit<EventProjectBuild>('PROJECT_BUILD', build, info, release, user);
    }, 500);
  } else {
    emit<EventProjectBuild>('PROJECT_BUILD', null, null, release, user);
    figma.notify('No components found to export', {error: true});
  }
}

// TODO: reload project config on root document update
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

function getAppConfig(
  collection: VariableCollection,
  variables: Variable[],
): ProjectInfo['appConfig'] {
  return variables.reduce((acc, cur) => {
    const defaultMode = collection.defaultModeId;
    const defaultValue = cur.valuesByMode[defaultMode]?.toString().trim();
    const [_group, _key] = cur.name.includes('/') ? cur.name.split('/') : ['General', cur.name];
    const group = titleCase(_group);
    const key = createIdentifierConstant(_key);
    if (!acc[group]) acc[group] = {};
    acc[group][key] = defaultValue;
    return acc;
  }, {} as ProjectInfo['appConfig']);
}

function getLocales(modes: VariableModes): ProjectInfo['locales'] {
  return {
    source: getLocaleData(modes.default.name)[0],
    all: modes.modes.map(mode =>
      getLocaleData(mode.name).map(s => s.trim()) as [string, string]),
  }
}

function getTranslations(
  locales: VariableCollection,
  messages: Variable[],
  modes: VariableModes,
): ProjectInfo['translations'] {
  return messages.reduce((acc, cur) => {
    const defaultMode = locales.defaultModeId;
    const defaultValue = cur.valuesByMode[defaultMode]?.toString().trim();
    const otherValues = Object.entries(cur.valuesByMode);
    acc[defaultValue] = otherValues.reduce((acc, [modeId, value]) => {
      if (modeId === defaultMode) return acc;
      const [locale] = getLocaleData(modes.modes?.find(mode => mode.modeId === modeId)?.name);
      if (locale) acc[locale] = value.toString().trim();
      return acc;
    }, {} as Record<string, string>);
    return acc;
  }, {} as ProjectInfo['translations']);
}

function getLocaleData(locale: string) {
  return locale.split(' – ');
}

