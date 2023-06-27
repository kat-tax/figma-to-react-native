import * as gen from './lib';
import type {NodeStyles} from 'types/figma';

export async function generateStyles(node: SceneNode): Promise<NodeStyles> {
  switch (node.type) {
    case 'GROUP':
    case 'FRAME':
    case 'ELLIPSE':
    case 'RECTANGLE':
    case 'COMPONENT':
    case 'COMPONENT_SET': {
      return {
        ...gen.layout(node),
        ...gen.position(node),
        ...gen.dimension(node),
        ...gen.padding(node),
        ...gen.background(node),
        ...gen.border(node),
        //...gen.shadow(node),
        //...gen.blends(node),
      };
    }
    case 'TEXT': {
      return {
        ...gen.position(node),
        ...gen.dimension(node, true),
        ...gen.typography(node),
      }
    }
    default: {
      console.warn('modules/css/custom/convert: unsupported node', node.type, node);
      return {};
    }
  }
}
