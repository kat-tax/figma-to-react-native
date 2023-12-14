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
  key: '',
  page: '',
  name: '',
  props: '',
  index: '',
  code: '',
  story: '',
  width: 0,
  height: 0,
  links: {},
  assets: null,
  icons: [],
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
      width: target.width,
      height: target.height,
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
  links[createIdentifierPascal(masterNode.name)] = masterNode.id;
  Object.entries(data.meta.components).forEach((c: any) => {
    links[createIdentifierPascal(c[1][0].name)] = c[0];
  });

  // Bundle data
  const id = masterNode.id;
  const key = (masterNode as ComponentNode).key;
  const width = data.frame ? data.frame.node.width : data.root.node.width;
  const height = data.frame ? data.frame.node.height : data.root.node.height;
  const name = createIdentifierPascal(masterNode.name);
  const page = getPage(masterNode)?.name;
  const props = getPropsJSX({...propDefs}, data.colorsheet, data.meta.includes);
  const code = generateCode(data, settings);
  const index = generateIndex(new Set<string>().add(name), settings);
  const story = generateStory(target, isVariant, propDefs, settings);
  const assets = Object.values(data.assetData);
  const icons = Array.from(data.meta.iconsUsed);

  // Return bundle
  return {
    id,
    key,
    name,
    page,
    props,
    width,
    height,
    links,
    icons,
    assets,
    code,
    index,
    story,
  };
}
