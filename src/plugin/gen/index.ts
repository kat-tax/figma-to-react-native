import {emit} from '@create-figma-plugin/utilities';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';
import {getComponentTargets, getComponentTarget, getPage} from 'plugin/fig/traverse';

import {wait} from 'common/delay';
import {generateIndex} from './common/generateIndex';
import * as reactNative from './react-native';
import * as config from 'plugin/config';

import type {Settings} from 'types/settings';
import type {EventComponentBuild, EventProjectTheme} from 'types/events';
import type {ComponentAsset, ComponentData, ComponentRoster} from 'types/component';

export {generateIndex} from './common/generateIndex';

const _cache: Record<string, ComponentData> = {};

export async function generateBundle(
  node: ComponentNode,
  settings: Settings,
  skipCache?: boolean,
) {
  if (!node) return;

  const instanceSettings = {...settings};

  // Check cache
  /*if (!skipCache && _cache[node.key]) {
    console.log('[cache]', node.name);
    return _cache[node.key];
  }
  // Check disk
  const cached = node.getPluginData('bundle');
  if (cached) {
    try {
      const bundle = JSON.parse(cached) as Component;
      console.log('[disk]', node.name);
      _cache[node.key] = bundle;
      return bundle;
    } catch (e) {
      console.error('Failed to parse cached bundle', node, e);
    }
  }*/

  let bundle: ComponentData;
  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      bundle = await reactNative.generateBundle(node, instanceSettings);
  }

  _cache[node.key] = bundle;

  return bundle;
}

export function generateTheme(settings: Settings) {
  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      return reactNative.generateTheme(settings);
  }
}

export function watchTheme(settings: Settings) {
  const updateTheme = () => {
    const {code, theme} = generateTheme(settings);
    const currentTheme = `${createIdentifierCamel(theme.current.name)}Theme`;
    emit<EventProjectTheme>('PROJECT_THEME', code, currentTheme);
  };
  figma.on('documentchange', updateTheme);
  updateTheme();
}

export async function startCompiler(onUpdate: () => void) {
  // TODO: Compile components on update
  /*figma.on('documentchange', async (e) => {
    console.log('[change]', e.documentChanges);
    const updates: SceneNode[] = [];
    e.documentChanges.forEach(change => {
      if (change.type !== 'CREATE' && change.type !== 'PROPERTY_CHANGE') return;
      if (change.node.removed) return;
      if (change.node.type === 'COMPONENT') {
        updates.push(change.node as SceneNode);
      } else {
        const target = getComponentTarget(change.node as SceneNode);
        if (target) {
          updates.push(target);
        }
      }
    });
    if (updates.length > 0) {
      const update = getComponentTargets(updates);
      await compile(update);
      onUpdate();
      console.log('[update]', Array.from(update));
    }
  });*/
  // Compile all components in background
  const all = figma.root.findAllWithCriteria({types: ['COMPONENT']});
  const init = getComponentTargets(all);
  if (init.size > 0) {
    await compile(init);
    //onUpdate();
  }
}

export async function compile(components: Set<ComponentNode>) {
  const _names = new Set<string>();
  const _assets: Record<string, ComponentAsset> = {};
  const _roster: ComponentRoster = {};

  let _total = 0;
  let _loaded = 0;

  for await (const component of components) {
    if (component.name.startsWith('ph:')) continue;
    const isVariant = !!(component as SceneNode & VariantMixin).variantProperties;
    const masterNode = (isVariant ? component?.parent : component);
    const imageExport = await (masterNode as ComponentNode).exportAsync({format: 'PNG'});
    const preview = imageExport ? `data:image/png;base64,${figma.base64Encode(imageExport)}` : '';
    const name = createIdentifierPascal(masterNode.name);
    const page = getPage(masterNode).name;
    const id = masterNode.id;
    _names.add(name);
    _roster[name] = {id, name, page, preview, loading: true};
    _total++;
  }

  const index = generateIndex(_names, config.state, true);

  for await (const component of components) {
    wait(1); // Prevent UI from freezing
    if (component.name.startsWith('ph:')) continue;
    try {
      const bundle = await generateBundle(component, config.state, false);
      const id = bundle.id;
      const page = bundle.page;
      const name = bundle.name;
      const pages = figma.root.children.map(p => p.name);
  
      bundle.assets?.forEach(asset => {
        _assets[asset.hash] = asset;
      });

      _cache[component.id] = bundle;
      _roster[name] = {
        ..._roster[name],
        id,
        name,
        page,
        loading: false,
      };
      _loaded++;
  
      component.setPluginData('bundle', JSON.stringify(bundle));
      emit<EventComponentBuild>('COMPONENT_BUILD', {
        index,
        pages,
        total: _total,
        loaded: _loaded,
        roster: _roster,
        assets: _assets,
        assetMap: {},
      }, bundle);
      console.log('[compile]', name, bundle);
    } catch (e) {
      console.error('Failed to export', component, e);
    }
  }
}
