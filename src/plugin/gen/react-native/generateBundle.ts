import parseFigma from 'plugin/fig/parse';
import {getPage} from 'plugin/fig/traverse';
import {propsToString} from 'plugin/fig/lib';
import {createIdentifierPascal} from 'common/string';
import {generatePrimitives} from '../primitives';
import {generateIndex} from '../common/generateIndex';
import {generateCode} from './generateCode';
import {generateStory} from './generateStory';
import {generateTheme} from './generateTheme';
import {generatePreview} from './generatePreview';

import type {PreviewComponent, PreviewEditorLinks} from 'types/preview';
import type {Settings} from 'types/settings';

const emptyBundle: PreviewComponent = {
  name: '',
  props: '',
  index: '',
  code: '',
  story: '',
  preview: '',
  links: {},
  assets: null,
};

export async function generateBundle(
  target: ComponentNode,
  settings: Settings,
  isPreviewMode?: boolean,
): Promise<PreviewComponent> {
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
      preview: generateTheme(settings, true) + '\n\n' + exo[target.name],
      code: exo[target.name],
    };
  }

  // Parse nodes
  const data = await parseFigma(target, settings, isPreviewMode);
  if (!data) {
    return emptyBundle;
  }

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
  // TODO: move some of this to fig/parse and make recursive for deeper instance swaps
  // OR move all of it to preview since this shit was all just to make preview work
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

  const name = createIdentifierPascal(masterNode.name);
  const props = propsToString({...propDefs}, data.meta.includes);
  return {
    name,
    links,
    assets,
    props,
    index: !isPreviewMode ? generateIndex(new Set<string>().add(name), settings) : '',
    code: !isPreviewMode ? generateCode(data, settings) : '',
    story: !isPreviewMode ? generateStory(target, isVariant, propDefs, settings) : '',
    preview: isPreviewMode ? await generatePreview(data, settings, exo) : '',
  };
}
