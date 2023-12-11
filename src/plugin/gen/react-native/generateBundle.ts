import parseFigmaComponent from 'plugin/fig';
import {getPropsJSX, getPage} from 'plugin/fig/lib';
import {createIdentifierPascal} from 'common/string';
import {generatePrimitives} from '../primitives';
import {generateIndex} from '../common/generateIndex';

import {generateCode} from './generateCode';
import {generateStory} from './generateStory';

import type {ComponentData, ComponentLinks} from 'types/component';
import type {Settings} from 'types/settings';

const emptyBundle: ComponentData = {
  id: '',
  page: '',
  name: '',
  props: '',
  index: '',
  code: '',
  story: '',
  links: {},
  assets: null,
  icons: {
    sets: [],
    list: [],
    used: [],
    map: {},
  },
};

export async function generateBundle(
  target: ComponentNode,
  settings: Settings,
): Promise<ComponentData> {
  // No target node, return empty bundle
  if (!target) {
    return emptyBundle;
  }

  // Generate exo primitives (if any)
  const isExo = getPage(target)?.name === 'Primitives';
  const exo = generatePrimitives();
  
  // Primitive component
  if (isExo && exo[target.name]) {
    return {
      ...emptyBundle,
      id: target.id,
      page: 'Primitives',
      name: createIdentifierPascal(target.name),
      code: exo[target.name],
    };
  }

  // Normal component, parse figma data
  const data = await parseFigmaComponent(target);
  if (!data) {
    return emptyBundle;
  }

  // Attributes
  const links: ComponentLinks = {};
  const isVariant = !!(target as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? target?.parent : target);
  const selectedVariant = (isVariant
    ? masterNode.children.filter((n: any) =>
      figma.currentPage.selection.includes(n)).pop()
    : undefined) as SceneNode & VariantMixin;

  // Prop definitions
  const propDefs = (masterNode as ComponentNode)?.componentPropertyDefinitions;
  if (selectedVariant) {
    Object.entries(selectedVariant?.variantProperties).forEach((v: any) => {
      propDefs[v[0]].defaultValue = v[1];
    });
  }

  // Component links
  Object.entries(data.meta.components).forEach((c: any) => {
    links[createIdentifierPascal(c[1][0].name)] = c[0];
  });

  // Bundle data
  const id = masterNode.id;
  const page = getPage(masterNode)?.name;
  const name = createIdentifierPascal(masterNode.name);
  const props = getPropsJSX({...propDefs}, data.colorsheet, data.meta.includes);
  const assets = Object.values(data.assetData);
  const code = generateCode(data, settings);
  const index = generateIndex(new Set<string>().add(name), settings);
  const story = generateStory(target, isVariant, propDefs, settings);
  const icons = {
    sets: Array.from(data.meta.iconsSets),
    list: Array.from(data.meta.iconsList),
    used: Array.from(data.meta.iconsUsed),
    map: Object.fromEntries(data.meta.iconsMap),
  };

  // Return bundle
  return {
    id,
    name,
    page,
    props,
    links,
    icons,
    assets,
    code,
    index,
    story,
  };
}
