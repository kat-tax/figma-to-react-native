import * as style from './lib';

import type {ParseStyles} from 'types/parse';

export async function generateStyles(node: SceneNode): Promise<ParseStyles> {
  switch (node.type) {
    case 'FRAME':
    case 'ELLIPSE':
    case 'RECTANGLE':
    case 'COMPONENT':
    case 'COMPONENT_SET': {
      return {
        ...style.layout(node),
        ...style.position(node),
        ...style.dimension(node),
        ...style.padding(node),
        ...style.background(node),
        ...style.border(node),
        //...style.shadow(node),
        //...style.blends(node),
      };
    }
    case 'TEXT': {
      return {
        ...style.position(node),
        ...style.dimension(node, true),
        ...style.typography(node),
      }
    }
    default: {
      console.warn('modules/css/custom/convert: unsupported node', node.type, node);
      return {};
    }
  }
}
