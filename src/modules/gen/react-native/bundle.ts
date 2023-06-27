import parseFigma from 'modules/fig/parse';
import {propsToString, getName} from 'modules/fig/utils';
import {generateComponent} from './component';
import {generatePreview} from './preview';
import {generateStory} from './story';

import type {TargetNode} from 'types/figma';
import type {EditorComponent, EditorLinks} from 'types/editor';
import type {Settings} from 'types/settings';

export async function generateBundle(target: TargetNode, settings: Settings, isPreviewMode?: boolean): Promise<EditorComponent> {
  // No target node, return empty bundle
  if (!target) {
    return {name: '', props: '',  code: '', story: '', preview: '', links: {}};
  }

  // Parse nodes
  const data = await parseFigma(target, settings);

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
    links[getName(c[1].name)] = c[0];
  });

  return {
    links,
    name: getName(masterNode.name),
    props: propsToString({...propDefs}),
    code: !isPreviewMode ? generateComponent(data, settings) : '',
    story: !isPreviewMode ? generateStory(target, isVariant, propDefs, settings) : '',
    preview: isPreviewMode ? await generatePreview(data, settings) : '',
  };
}

  