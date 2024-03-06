import {blake2sHex} from 'blakejs';
import {createIdentifierCamel, createIdentifierPascal} from 'common/string';

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
    for await (const id of nodes) {
      let embed: string;
      let count: number;
      let bytes: Uint8Array;
  
      const node = figma.getNodeById(id) as SceneNode & ExportMixin & ChildrenMixin;
      
      const isVector = VECTOR_NODE_TYPES.includes(node.type)
        || (node.findAllWithCriteria
          && node.findAllWithCriteria({types: VECTOR_NODE_TYPES})?.length > 0);

      const isVideo = node.type === 'EMBED'
        || (node.findAllWithCriteria
          && node.findAllWithCriteria({types: ['EMBED']})?.length > 0);
      
      const identifier = isVector
        ? createIdentifierPascal(node.name)
        : createIdentifierCamel(node.name);

      if (isVector) {
        vectors[node.name] = 1 + (vectors[node.name] || 0);
        hasVector = true;
        count = vectors[node.name];
        bytes = await node.exportAsync({format: 'SVG'});
        embed = bytes
          ? `data:image/svg+xml;base64,${figma.base64Encode(bytes)}`
          : 'data:image/svg+xml;base64,<svg/>';
      } else {
        rasters[node.name] = 1 + (rasters[node.name] || 0);
        hasRaster = true;
        count = rasters[node.name];
        bytes = await node.exportAsync({format: 'PNG', constraint: {type: 'SCALE', value: 2}});
        embed = bytes
          ? `data:image/png;base64,${figma.base64Encode(bytes)}`
          : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
      }

      const rawName = node.name;
      const name = count > 1 ? `${identifier}${count}` : identifier;
      const data = bytes || embed;
      const hash = bytes ? blake2sHex(data) : '';
      const {width, height} = node;
      assetMap[id] = hash;
      assetData[id] = {
        width,
        height,
        name,
        hash,
        embed,
        bytes,
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
