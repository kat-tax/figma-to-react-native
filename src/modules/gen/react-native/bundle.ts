import parseFigma from 'modules/fig/parse';
import {propsToString} from 'modules/fig/utils';
import {createIdentifierPascal} from 'common/string';
import {generateComponent} from './component';
import {generatePreview} from './preview';
import {generateStory} from './story';
import {generateIndex} from '../common';

import type {TargetNode} from 'types/figma';
import type {EditorComponent, EditorLinks} from 'types/editor';
import type {Settings} from 'types/settings';

export async function generateBundle(
  target: TargetNode,
  settings: Settings,
  isPreviewMode?: boolean,
): Promise<EditorComponent> {
  // No target node, return empty bundle
  if (!target) {
    return {name: '', props: '', index: '', code: '', story: '', preview: '', links: {}, assets: null};
  }

  // Parse nodes
  const data = await parseFigma(target, settings, isPreviewMode);

  // Attributes
  const links: EditorLinks = {};
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
    links[createIdentifierPascal(c[1].name)] = c[0];
  });

  // Bundle assets
  const assets: Array<[string, Uint8Array]> = [];
  if (!isPreviewMode) {
    for (const [, asset] of Object.entries(data.assets)) {
      const folder = `${asset.isVector ? 'vectors' : 'images'}`;
      const extension = `${asset.isVector ? '.svg' : '.png'}`;
      assets.push([`${folder}/${asset.name}.${extension}`, asset.bytes]);
    }
  }

  const name = createIdentifierPascal(masterNode.name);
  return {
    name,
    links,
    assets,
    props: propsToString({...propDefs}),
    index: !isPreviewMode ? generateIndex(new Set<string>().add(name), settings) : '',
    code: !isPreviewMode ? generateComponent(data, settings) : '',
    story: !isPreviewMode ? generateStory(target, isVariant, propDefs, settings) : '',
    preview: isPreviewMode ? await generatePreview(data, settings) : '',
  };
}
