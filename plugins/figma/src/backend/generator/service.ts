import {emit} from '@create-figma-plugin/utilities';
import {getAllIconComponents} from 'backend/importer/icons';
import {getComponentTargets, getComponentTarget, getVariableCollectionModes, getPage} from 'backend/parser/lib';
import {createIdentifierCamel, createIdentifierPascal} from 'common/string';
import {areMapsEqual, areSetsEqual} from 'common/assert';
import {wait} from 'common/delay';
import * as config from 'backend/utils/config';

import {generateIndex} from './lib/generateIndex';
import {generateTheme} from './lib/generateTheme';
import {generateBundle} from './lib/generateBundle';
import {VARIABLE_COLLECTIONS} from './lib/consts';

import type {ComponentAsset, ComponentData, ComponentLinks, ComponentRoster} from 'types/component';
import type {EventComponentBuild, EventProjectTheme, EventProjectLanguage, EventProjectIcons} from 'types/events';
import type {ProjectSettings} from 'types/settings';

const _cache: Record<string, ComponentData> = {};

export async function watchComponents(targetComponent: () => void) {
  // Compile all components in background on init
  const all = getComponentTargets(figma.root.findAllWithCriteria({types: ['COMPONENT']}));
  if (all.size > 0) {
    const cached = await compile(all);
    if (cached) {
      // Select targeted component since it's available now
      targetComponent();
      // Refresh component cache
      await compile(all, true);
    }
  }

  // Recompile changed components on doc change
  figma.on('documentchange', async (e) => {
    // console.log('[change]', e.documentChanges);
    // We need to get all components for the roster
    const all = getComponentTargets(figma.root.findAllWithCriteria({types: ['COMPONENT']}));
    // No components, do nothing
    if (all.size === 0) return;
    // Get all components that were updated
    const updates: SceneNode[] = [];
    e.documentChanges.forEach(change => {
      // Ignore events that aren't relevant
      if (change.type !== 'CREATE'
        && change.type !== 'PROPERTY_CHANGE')
          return;
      // Ignore events only effecting pluginData (our cache)
      if (change.type === 'PROPERTY_CHANGE'
        && change.properties.includes('pluginData'))
          return;
      // Queue component to update
      if (change.node.type === 'COMPONENT') {
        updates.push(change.node as SceneNode);
      } else {
        const target = getComponentTarget(change.node as SceneNode);
        if (target) {
          updates.push(target);
        }
      }
    });

    // No updates, do nothing
    if (updates.length === 0) return;

    // Get updated targets and compile
    const update = getComponentTargets(updates);
    await compile(all, true, update);
    // console.log('[update]', Array.from(update));
  });
}

export async function watchTheme(settings: ProjectSettings) {
  const updateTheme = async () => {
    const tokens = await generateTheme(settings);
    const {code, collection, hasStyles} = tokens.themes;
    const themeName = collection?.current
      ? `${createIdentifierCamel(collection.current.name)}`
      : 'main';
    emit<EventProjectTheme>('PROJECT_THEME', code, themeName, hasStyles);
  };
  setInterval(updateTheme, 600);
  updateTheme();
}

export async function watchIcons() {
  let _sets = new Set<string>();
  let _list = new Set<string>();
  let _map = new Map<string, string>();

  const updateIcons = () => {
    const icons = getAllIconComponents();
    const sets = new Set(icons?.map((i) => i.name.split(':')[0]));
    const list = new Set(icons?.map((i) => i.name));
    const map = new Map(icons?.map((i) => [i.name, i.id]));

    if (areMapsEqual(map, _map)
      && areSetsEqual(sets, _sets)
      && areSetsEqual(list, _list))
      return;

    _sets = sets;
    _list = list;
    _map = map;

    emit<EventProjectIcons>(
      'PROJECT_ICONS',
      Array.from(sets),
      Array.from(list),
      Object.fromEntries(map),
    );
  };
  setInterval(updateIcons, 500);
  updateIcons();
}

export async function watchLocales() {
  let _lastLanguage = '';
  const updateLanguage = async () => {
    const language = await getVariableCollectionModes(VARIABLE_COLLECTIONS.LOCALES);
    if (!language || !language.current) return;
    const name = language.current.name;
    if (name === _lastLanguage) return;
    _lastLanguage = name;
    emit<EventProjectLanguage>('PROJECT_LANGUAGE', name);
  };
  setInterval(updateLanguage, 300);
  updateLanguage();
}

async function compile(
  components: Set<ComponentNode>,
  skipCache?: boolean,
  updated?: Set<ComponentNode>,
) {
  const _names = new Set<string>();
  const _icons = new Set<string>();
  const _assets: Record<string, ComponentAsset> = {};
  const _roster: ComponentRoster = {};
  let _links: ComponentLinks = {};

  let _total = 0;
  let _loaded = 0;
  let _cached = false;

  for await (const component of components) {
    const isVariant = !!(component as SceneNode & VariantMixin).variantProperties;
    const masterNode = (isVariant ? component?.parent : component);
    const imageExport = false; // TODO: await (masterNode as ComponentNode).exportAsync({format: 'PNG'});
    const preview = imageExport ? `data:image/png;base64,${figma.base64Encode(imageExport)}` : '';
    const name = createIdentifierPascal(masterNode.name);
    const page = getPage(masterNode).name;
    const key = (masterNode as ComponentNode).key;
    const id = masterNode.id;
    _total++;
    _names.add(name);
    _roster[key] = {
      id,
      key,
      name,
      page,
      preview,
      loading: !skipCache,
    };
  }

  const index = generateIndex(_names, config.state, true);
  const targets = updated || components;

  for await (const component of targets) {
    wait(1); // Prevent UI from freezing
    try {
      // Compile component
      const res = await bundle(component, config.state, skipCache);

      // Derive data
      const {id, key, page, name, links, icons, assets} = res.bundle;
      const pages = figma.root.children?.map(p => p.name);

      // Aggregate data
      _loaded++;
      _cached = res.cached;
      _links = {..._links, ...links};
      _cache[component.id] = res.bundle;
      _roster[key] = {
        ..._roster[name],
        id,
        name,
        page,
        loading: false,
      };

      // Aggregate assets and icons
      icons?.forEach(icon => {_icons.add(icon)});
      assets?.forEach(asset => {_assets[asset.hash] = asset});
      
      // Cache compilation to disk
      component.setSharedPluginData('f2rn', 'data', JSON.stringify(res.bundle));

      // Send compilation to interface
      emit<EventComponentBuild>('COMPONENT_BUILD', {
        index,
        pages,
        links: _links,
        total: _total,
        loaded: _loaded,
        roster: _roster,
        assets: _assets,
        icons: Array.from(_icons),
        assetMap: {},
      }, res.bundle);

      // console.log('[compile]', name, bundle);
    } catch (e) {
      console.error('Failed to export', component, e);
    }
  }

  return _cached;
}

async function bundle(
  node: ComponentNode,
  settings: ProjectSettings,
  skipCache?: boolean,
) {
  if (!node) return;

  const instanceSettings = {...settings};

  // Check cache
  if (!skipCache) {
    // Memory cache
    if (_cache[node.key]) {
      //console.log('[cache/memory]', node.name);
      return {bundle: _cache[node.key], cached: true};
    }
    // Disk cache
    const data = node.getSharedPluginData('f2rn', 'data');
    if (data) {
      try {
        const bundle = JSON.parse(data) as ComponentData;
        //console.log('[cache/disk]', node.name);
        _cache[node.key] = bundle;
        return {bundle, cached: true};
      } catch (e) {
        console.error('Failed to parse cached bundle', node, e);
      }
    }
  }

  //console.log('[cache/hit]', node.name);

  const bundle: ComponentData = await generateBundle(node, instanceSettings);
  _cache[node.key] = bundle;

  return {bundle, cached: false};
}
