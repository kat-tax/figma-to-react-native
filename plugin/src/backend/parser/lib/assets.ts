import {getNode, getRectAssetType} from './node';
import {rgbaToThumbHash, byteArrayToBase64} from 'common/thumbhash';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';

import type {ParseAssetData} from 'types/parse';

const VECTOR_NODE_TYPES: NodeType[] = ['VECTOR', 'LINE', 'POLYGON', 'STAR'];

export async function getAssets(nodes: Set<string>, component: ComponentNode): Promise<ParseAssetData> {
  const assetData: ParseAssetData = {};
  const rasters: Record<string, number> = {};
  const vectors: Record<string, number> = {};

  let hasRaster = false;
  let hasVector = false;

  try {
    for (const id of nodes) {
      let count: number;
      let bytes: Uint8Array;
      let thumb: string | null = null;

      const node = getNode(id) as SceneNode & ExportMixin & ChildrenMixin & MinimalFillsMixin;
      const slug = node.name.includes('|') ? node.name.split('|')[0].trim() : node.name;
      const {width, height} = node;

      const isVideo = getRectAssetType(node) === 'video';
      const isVector = VECTOR_NODE_TYPES.includes(node.type)
        || (node.findAllWithCriteria
          && node.findAllWithCriteria({types: VECTOR_NODE_TYPES})?.length > 0);

      const identifier = isVector
        ? createIdentifierPascal(slug)
        : createIdentifierCamel(slug);

      if (isVector) {
        vectors[slug] = 1 + (vectors[slug] || 0);
        hasVector = true;
        count = vectors[slug];
        bytes = await node.exportAsync({format: 'SVG'});
      } else {
        rasters[slug] = 1 + (rasters[slug] || 0);
        hasRaster = true;
        count = rasters[slug];
        bytes = await node.exportAsync({format: 'PNG', constraint: {type: 'SCALE', value: 2}});
        // TODO: scale thumbhash to node dimensions
        // thumb = byteArrayToBase64(rgbaToThumbHash(100, 100, bytes));
      }

      const rawName = node.name;
      const parent = component.key;
      const name = count > 1 ? `${identifier}${count}` : identifier;

      console.log('>>> [assets] node', name, parent);

      assetData[id] = {
        id,
        name,
        rawName,
        parent,
        width,
        height,
        bytes,
        thumb,
        isVideo,
        isVector,
      };
    }
  } catch (err) {
    console.error('[assets] Failed to convert', err);
  }
  return assetData;
}

