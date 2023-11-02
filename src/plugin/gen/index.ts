import {getComponentTargets, getComponentTarget} from 'plugin/fig/traverse';
import {emit} from '@create-figma-plugin/utilities';
import {createIdentifierPascal} from 'common/string';
import {wait} from 'common/delay';

import * as config from 'plugin/config';
import * as reactNative from './react-native';

import type {Settings} from 'types/settings';
import type {PreviewComponent} from 'types/preview';
import type {EventLoadComponent} from 'types/events';

export {generateIndex} from './common/generateIndex';

const _cache: Record<string, PreviewComponent> = {};

export async function generateBundle(
  node: ComponentNode,
  settings: Settings,
  isPreviewMode?: boolean,
  skipCache?: boolean,
) {
  if (!node) return;

  const instanceSettings = {...settings};
  if (isPreviewMode) {
    instanceSettings.react.addTranslate = false;
  }

  // TODO: cache preview mode too when it's conformed
  if (!skipCache && _cache[node.id] && !isPreviewMode) {
    console.log('[cache]', node.name);
    return _cache[node.id];
  }

  let bundle: PreviewComponent;
  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      bundle = await reactNative.generateBundle(node, instanceSettings, isPreviewMode);
  }

  // TODO: cache preview mode too when it's conformed
  if (!isPreviewMode) {
    _cache[node.id] = bundle;
  }

  return bundle;
}

export function generateTheme(settings: Settings) {
  switch (settings?.react.flavor) {
    case 'react-native':
    default:
      return reactNative.generateTheme(settings);
  }
}

export async function startCompiler(onUpdate: () => void) {
  // Compile components on update
  figma.on('documentchange', async (e) => {
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
  });
  // Compile all components in background
  const all = figma.root.findAllWithCriteria({types: ['COMPONENT']});
  const init = getComponentTargets(all);
  if (init.size > 0) {
    await compile(init);
    onUpdate();
  }
}

async function compile(components: Set<ComponentNode>) {
  const _list: Record<string, boolean> = {};
  let _total = 0;
  let _loaded = 0;
  let _assets = 0;
  for (const component of components) {
    if (component.name.startsWith('ph:')) continue;
    const isVariant = !!(component as SceneNode & VariantMixin).variantProperties;
    const masterNode = (isVariant ? component?.parent : component);
    const name = createIdentifierPascal(masterNode.name);
    _list[name] = true;
    _total++;
  }
  for await (const component of components) {
    wait(1); // Prevent UI from freezing
    if (component.name.startsWith('ph:')) continue;
    try {
      console.log('[compile]', component.name);
      const bundle = await generateBundle(component, config.state, false, true);
      _list[bundle.name] = false;
      _cache[component.id] = bundle;
      _loaded++;
      _assets += bundle.assets?.length || 0;
      emit<EventLoadComponent>('LOAD_COMPONENT', bundle, _list, _loaded, _total, _assets);
    } catch (e) {
      console.error('Failed to export', component, e);
    }
  }
}
