import {blake2sHex} from 'blakejs';
import {rgbaToThumbHash, byteArrayToBase64} from 'common/thumbhash';
import * as string from 'common/string';

import type {ParseAssetData} from 'types/parse';

const VECTOR_NODE_TYPES: NodeType[] = ['VECTOR', 'LINE', 'POLYGON', 'STAR'];

export async function getAssets(nodes: Set<string>): Promise<{
  assetData: ParseAssetData,
  assetMap: Record<string, string>,
  hasRaster: boolean,
  hasVector: boolean,
}> {
  const assetData: ParseAssetData = {};
  const assetMap: Record<string, string> = {};
  const rasters: Record<string, number> = {};
  const vectors: Record<string, number> = {};

  let hasRaster = false;
  let hasVector = false;

  try {
    for (const id of nodes) {
      let count: number;
      let bytes: Uint8Array;
      let thumbhash: string;
  
      const node = figma.getNodeById(id) as SceneNode & ExportMixin & ChildrenMixin & MinimalFillsMixin;
      
      const isVector = VECTOR_NODE_TYPES.includes(node.type)
        || (node.findAllWithCriteria
          && node.findAllWithCriteria({types: VECTOR_NODE_TYPES})?.length > 0);

      const isVideo = node.type === 'EMBED'
        || (node.findAllWithCriteria
          && node.findAllWithCriteria({types: ['EMBED']})?.length > 0);
      
      const identifier = isVector
        ? string.createIdentifierPascal(node.name)
        : string.createIdentifierCamel(node.name);

      if (isVector) {
        vectors[node.name] = 1 + (vectors[node.name] || 0);
        hasVector = true;
        count = vectors[node.name];
        bytes = await node.exportAsync({format: 'SVG'});
        //embed = bytes
        //  ? `data:image/svg+xml;base64,${figma.base64Encode(bytes)}`
        //  : 'data:image/svg+xml;base64,<svg/>';
      } else {
        //const thumbBytes = await node.exportAsync({format: 'PNG', constraint: {type: 'WIDTH', value: 100}});
        //thumbhash = byteArrayToBase64(rgbaToThumbHash(100, 100, thumbBytes));

        // TODO: replace export w/ getImage, lookup via figma.getImageByHash (must support most props, rotate, fit, etc.)
        // const image = getImage(node.fills);
        
        rasters[node.name] = 1 + (rasters[node.name] || 0);
        hasRaster = true;
        count = rasters[node.name];
        bytes = await node.exportAsync({format: 'PNG', constraint: {type: 'SCALE', value: 2}});
        //embed = bytes
        //  ? `data:image/png;base64,${figma.base64Encode(bytes)}`
        //  : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
      }

      const rawName = node.name;
      const name = count > 1 ? `${identifier}${count}` : identifier;
      const hash = bytes ? blake2sHex(bytes) : '';
      const {width, height} = node;
      assetMap[id] = hash;
      assetData[id] = {
        width,
        height,
        name,
        hash,
        bytes,
        thumbhash,
        rawName,
        isVector,
        isVideo,
      };
    }
  } catch (err) {
    console.error('[assets] Failed to convert', err);
  }
  return {
    assetData,
    assetMap,
    hasRaster,
    hasVector,
  };
}

function getImage(fills: ReadonlyArray<Paint> | PluginAPI['mixed']): ImagePaint | undefined {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    return [...fills].reverse().find((fill) =>
      fill.type === 'IMAGE' && fill.visible !== false) as ImagePaint;
  }
}
