// import {blake3} from 'hash-wasm';
import {createIdentifierCamel, createIdentifierPascal} from 'common/string';

import type {ParseAssetData} from 'types/parse';

const IMAGE_BLANK_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export async function convertAssets(nodes: Set<string>): Promise<{
  assets: ParseAssetData,
  assetMap: Record<string, string>,
  hasRaster: boolean,
  hasVector: boolean,
}> {
  const assets: ParseAssetData = {};
  const assetMap: Record<string, string> = {};

  const vectorTypes: NodeType[] = ['VECTOR', 'LINE', 'ELLIPSE', 'POLYGON', 'STAR'];
  
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
      const {width, height} = node;
      const isVector = vectorTypes.includes(node.type)
        || (node.findAllWithCriteria && node.findAllWithCriteria({types: vectorTypes})?.length > 0);
      if (isVector) {
        bytes = await node.exportAsync({format: 'SVG'});
        embed = await node.exportAsync({format: 'SVG_STRING'});
        embed = embed
          .replace(/fill=\"none\"/, `fill="currentColor"`)
          .replace(/fill="#[0-9A-Fa-f]+"/g, 'fill="currentColor"');
        vectors[node.name] = 1 + (vectors[node.name] || 0);
        count = vectors[node.name];
        hasVector = true;
      } else {
        let arr: Uint8Array;
        try {arr = await node.exportAsync({format: 'PNG', constraint: {type: 'SCALE', value: 2}});} catch (err) {}
        embed = arr ? `data:image/png;base64,${figma.base64Encode(arr)}` : IMAGE_BLANK_PIXEL;
        bytes = arr || null;
        rasters[node.name] = 1 + (rasters[node.name] || 0);
        count = rasters[node.name];
        hasRaster = true;
      }
      const nameBase = isVector
        ? createIdentifierPascal(node.name)
        : createIdentifierCamel(node.name);
      const name = count > 1 ? `${nameBase}${count}` : nameBase;
      const hash = 'xxx'; // await blake3(bytes);
      assets[hash] = {width, height, name, embed, bytes, isVector};
      assetMap[id] = hash;
    }
  } catch (err) {
    console.error('Failed to convert assets', err);
  }
  return {assets, assetMap, hasRaster, hasVector};
}
