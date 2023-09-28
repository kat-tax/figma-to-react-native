import parseFigma from 'plugin/fig/parse';
import {propsToString} from 'plugin/fig/lib';
import {createIdentifierPascal} from 'common/string';

import {generateIndex} from '../common/generateIndex';
import {generateCode} from './generateCode';
import {generateStory} from './generateStory';
import {generatePreview} from './generatePreview';

import type {PreviewComponent, PreviewEditorLinks} from 'types/preview';
import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export async function generateBundle(
  target: TargetNode,
  settings: Settings,
  isPreviewMode?: boolean,
): Promise<PreviewComponent> {
  // No target node, return empty bundle
  if (!target) {
    return {name: '', props: '', index: '', code: '', story: '', preview: '', links: {}, assets: null};
  }

  // Parse nodes
  const data = await parseFigma(target, settings, isPreviewMode);

  // Attributes
  const links: PreviewEditorLinks = {};
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

  // Look through instance swaps and imported needed components for preview
  // (buttons that have icons, etc.)
  // TODO: move this to fig/parse and support deeper instance swaps (swap of a swap of swap)
  // OR move to preview since this shit was all just to make preview work
  // Currently this only supports two levels of instance swaps
  if (isPreviewMode) {
    propDefs && Object.entries(propDefs).forEach(([k, v]: any) => {
      if (v.type === 'INSTANCE_SWAP' && v.defaultValue) {
        const swapNode = figma.getNodeById(v.defaultValue);
        const isSwapVariant = !!(swapNode as SceneNode & VariantMixin).variantProperties;
        const swapMasterNode = (isSwapVariant ? swapNode?.parent : swapNode);
        const swapNodes = data.meta.includes[swapMasterNode.id];
        if (swapNodes) {
          const swapInstance = swapNodes[1] as InstanceNode;
          if (swapInstance.componentProperties) {
            Object.entries(swapInstance.componentProperties).forEach(([kk, vv]: any) => {
              if (vv.type === 'INSTANCE_SWAP') {
                const subSwapNode = figma.getNodeById(vv.value);
                data.meta.includes[subSwapNode.id] = [subSwapNode, subSwapNode];
              }
            });
          }
        }
      }
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
      const extension = `${asset.isVector ? 'svg' : 'png'}`;
      assets.push([`${folder}/${asset.name}.${extension}`, asset.bytes]);
    }
  }

  const name = createIdentifierPascal(masterNode.name);
  return {
    name,
    links,
    assets,
    props: propsToString({...propDefs}, data.meta.includes),
    index: !isPreviewMode ? generateIndex(new Set<string>().add(name), settings) : '',
    code: !isPreviewMode ? generateCode(data, settings) : '',
    story: !isPreviewMode ? generateStory(target, isVariant, propDefs, settings) : '',
    preview: isPreviewMode ? await generatePreview(data, settings) : '',
  };
}
