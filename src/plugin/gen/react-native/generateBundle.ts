import parseFigma from 'plugin/fig/parse';
import {getPage} from 'plugin/fig/traverse';
import {propsToString} from 'plugin/fig/lib';
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
  links: {},
  assets: null,
};

export async function generateBundle(
  target: ComponentNode,
  settings: Settings,
  isPreviewMode?: boolean,
): Promise<ComponentData> {
  // No target node, return empty bundle
  if (!target) {
    return emptyBundle;
  }

  // Generate exo primitives (if any)
  const isRootExo = getPage(target)?.name === 'Primitives';
  const exo = generatePrimitives(isPreviewMode, isRootExo);
  
  // Primitive component
  if (isRootExo && exo[target.name]) {
    return {
      ...emptyBundle,
      name: createIdentifierPascal(target.name),
      code: exo[target.name],
    };
  }

  // Parse nodes
  const data = await parseFigma(target);
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

  // Bundle assets
  const assets: Array<[string, Uint8Array]> = [];
  if (!isPreviewMode) {
    for (const [, asset] of Object.entries(data.assets)) {
      const folder = `${asset.isVector ? 'vectors' : 'images'}`;
      const extension = `${asset.isVector ? 'svg' : 'png'}`;
      assets.push([`${folder}/${asset.name}.${extension}`, asset.bytes]);
    }
  }

  const id = masterNode.id;
  const key = (masterNode as ComponentNode).key;
  const page = getPage(masterNode)?.name;
  const name = createIdentifierPascal(masterNode.name);
  const props = propsToString({...propDefs}, data.meta.includes);
  return {
    id,
    key,
    name,
    page,
    props,
    assets,
    links,
    code: !isPreviewMode ? generateCode(data, settings) : '',
    index: !isPreviewMode ? generateIndex(new Set<string>().add(name), settings) : '',
    story: !isPreviewMode ? generateStory(target, isVariant, propDefs, settings) : '',
  };
}
