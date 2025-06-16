import {getAllIconComponents} from 'backend/importer/icons';
import {on, emit} from '@create-figma-plugin/utilities';

import * as assert from 'common/assert';
import * as string from 'common/string';
import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';
import * as config from 'backend/utils/config';

import {generateIndex} from './lib/generateIndex';
import {generateTheme} from './lib/generateTheme';
import {generateBundle} from './lib/generateBundle';

import type {ComponentInfo, ComponentAsset, ComponentLinks, ComponentRoster} from 'types/component';
import type {EventComponentBuild, EventProjectTheme, EventProjectIcons, EventNodeAttrSave, EventPropsSave} from 'types/events';
import type {ProjectSettings} from 'types/settings';

let _lastThemeCode = '';
let _lastThemeName = '';
let _infoDb: Record<string, ComponentInfo> | null = null;

export async function watchComponents(
  targetComponent: () => void,
  updateBackground: () => void,
) {
  // Save component props when parsed
  on<EventPropsSave>('PROPS_SAVE', async (props) => {
    console.log('>> [props/save]', props);
    for (const [key, value] of Object.entries(props)) {
      figma.clientStorage.setAsync(`${consts.F2RN_CACHE_PROPS}:${key}`, value);
    }
  });

  // Recompile component on node attribute change
  on<EventNodeAttrSave>('NODE_ATTR_SAVE', (nodeId, newAttrs) => {
    figma.commitUndo();
    const node = parser.getNode(nodeId);
    node.setSharedPluginData('f2rn', consts.F2RN_NODE_ATTRS, JSON.stringify(
      Object.fromEntries(
        Object.entries(newAttrs).map(([group, groupAttrs]) => [
          group,
          groupAttrs.filter(attr => attr.data !== null)
        ])
      )
    ));
  });

  // Init: update background preview color
  updateBackground();

  // Init: compile all components in background
  const all = parser.getComponentTargets(figma.root.findAllWithCriteria({types: ['COMPONENT']}));
  if (all.size > 0) {
    await compile(all);
    // Select targeted component since it's available now
    targetComponent();
    // TODO: Refresh component cache, needs heuristic to detect if we need to recompile all components
    // await compile(all, true);
  }

  // Recompile changed components on doc change
  figma.on('documentchange', async (e) => {
    // Page background update
    if (e.documentChanges.length === 1
      && e.documentChanges[0].type === 'PROPERTY_CHANGE'
      && e.documentChanges[0].properties.includes('backgrounds')) {
      updateBackground();
      return;
    }

    // Theme change (all components are affected, ignore)
    if (e.documentChanges?.some(c => c.type === 'PROPERTY_CHANGE' && c.node.type === 'SECTION')) {
      return;
    }

    // We need to get all components for the roster
    const all = parser.getComponentTargets(figma.root.findAllWithCriteria({types: ['COMPONENT']}));

    // No components, do nothing
    if (all.size === 0) return;

    // All components that were updated
    const updateDeep: SceneNode[] = [];    // Deep changes (style, asset, etc)
    const updateShallow: SceneNode[] = []; // Shallow changes (pluginData)

    // Process all changes
    e.documentChanges.forEach(change => {
      // Debug
      // console.log('>> [event]', change);

      const isCreate = change.type === 'CREATE';
      const isPropChange = change.type === 'PROPERTY_CHANGE';
      const isDataOnlyChange = isPropChange && change.properties.every(p => p === 'pluginData');

      // Ignore events that aren't relevant
      if (!isCreate && !isPropChange) return;

      // Queue component to update
      if (change.node.type === 'COMPONENT') {
        if (isDataOnlyChange) {
          updateShallow.push(change.node as SceneNode);
        } else {
          updateDeep.push(change.node as SceneNode);
        }
      } else {
        const target = parser.getComponentTarget(change.node as SceneNode);
        if (target) {
          if (isDataOnlyChange) {
            updateShallow.push(target);
          } else {
            updateDeep.push(target);
          }
        }
      }
    });

    // Compile updates
    await Promise.all([
      compile(all, true, parser.getComponentTargets(updateDeep)),
      compile(all, false, parser.getComponentTargets(updateShallow)),
    ]);

    // Debug
    // console.log('>> [update]', {
    //   deep: Array.from(updateDeep),
    //   shallow: Array.from(updateShallow),
    // });
  });
}

export async function watchTheme(settings: ProjectSettings) {
  const updateTheme = async () => {
    const tokens = await generateTheme(settings);
    const {code, collection, hasStyles} = tokens.themes;
    const colName = collection?.current?.name ?? collection?.default?.name;
    const themeName = collection
      ? `${string.createIdentifierCamel(colName)}`
      : 'main';
    if (code === _lastThemeCode && themeName === _lastThemeName)
        return;
    _lastThemeCode = code;
    _lastThemeName = themeName;
    emit<EventProjectTheme>('PROJECT_THEME', code, themeName, hasStyles);
  };
  setInterval(updateTheme, 1200);
  updateTheme();
}

export async function watchIcons() {
  let _sets = new Set<string>();
  let _list = new Set<string>();
  let _maps = new Map<string, string>();
  let _names = new Map<string, string>();

  const updateIcons = () => {
    const icons = getAllIconComponents();
    if (!icons?.length) return;

    const sets = new Set<string>();
    const list = new Set<string>();
    const maps = new Map<string, string>();
    const names = new Map<string, string>();

    for (const icon of icons) {
      const name = icon.name;
      const prefix = name.split(':')[0];
      const iconSet = icon.parent.name.split(',')[0];
      sets.add(prefix);
      list.add(name);
      maps.set(name, icon.id);
      names.set(prefix, iconSet);
    }

    if (assert.areMapsEqual(maps, _maps)
      && assert.areSetsEqual(sets, _sets)
      && assert.areSetsEqual(list, _list)
      && assert.areMapsEqual(names, _names)) {
      return;
    }

    _sets = sets;
    _list = list;
    _maps = maps;
    _names = names;

    emit<EventProjectIcons>(
      'PROJECT_ICONS',
      Array.from(sets),
      Array.from(list),
      Object.fromEntries(maps),
      Object.fromEntries(names),
    );
  };
  setInterval(updateIcons, 500);
  updateIcons();
}

export async function compile(
  components: Set<ComponentNode>,
  skipCache?: boolean,
  updated?: Set<ComponentNode>,
) {
  if (components.size === 0) return;

  const _info: Record<string, ComponentInfo> = {};
  const _assets: Record<string, ComponentAsset> = {};
  const _icons = {list: new Set<string>(), count: {}};
  const _roster: ComponentRoster = {};

  let _links: ComponentLinks = {};
  let _total = 0;
  let _loaded = 0;

  // Iterate over all components, fill roster, info, and total
  for (const component of components) {
    // @ts-ignore
    const master = component.type === 'INSTANCE' ? component.mainComponent : component;
    const cache = updated?.has(master) ? null : _infoDb;
    const info = parser.getComponentInfo(master, cache);
    if (!info) continue;
    const {name, page, path, target} = info;
    const {id, key} = target;
    const loading = !_infoDb?.[key];
    const preview = await master.exportAsync({
      format: 'PNG',
      contentsOnly: true,
      constraint: {
        type: 'HEIGHT',
        value: 240,
      },
    });
    _total++;
    _info[key] = info;
    _roster[key] = {id, name, page: page.name, path, loading, preview};
  }

  // Update component info cache
  _infoDb = _info;

  // Generate index
  const index = generateIndex(Object.values(_info), config.state, true);

  // Compile either all components or just updated components if provided
  for (const component of updated || components) {
    try {
      if (!component) continue;

      const bundle = await generateBundle(component, _info, {...config.state}, skipCache);
      const {info, links, icons, assets} = bundle;
      const {name, page, target} = info;
      const {key, id} = target;

      // Aggregate data
      _loaded++;
      _links = {..._links, ...links};
      _roster[key] = {
        ..._roster[key],
        id,
        name: name,
        page: page.name,
        hasError: info.hasError,
        errorMessage: info.errorMessage,
        loading: false,
      };

      // Aggregate assets and icons
      assets?.forEach(asset => {_assets[asset.hash] = asset});
      icons?.list?.forEach(icon => {_icons.list.add(icon)});
      Object.entries(icons?.count).forEach(([icon, count]) => {
        _icons.count[icon] = (icons?.count[icon] || 0) + count;
      });

      // Send compilation to interface
      emit<EventComponentBuild>('COMPONENT_BUILD', key, {
        index,
        links: _links,
        total: _total,
        loaded: _loaded,
        roster: _roster,
        pages: figma.root.children?.map(p => p.name),
        assets: _assets,
        assetMap: {},
        icons: {
          list: Array.from(_icons.list),
          count: _icons.count,
        },
      }, bundle);
    } catch (e) {
      console.error('Failed to export', component, e);
    }
  }
}
