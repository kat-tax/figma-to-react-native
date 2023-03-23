import {parseStyles} from 'modules/parse/style';
import {getTag, getName, getSlug} from 'utils/figma';

import type {TargetNode} from 'types/figma';
import type {ReactComponent} from 'types/react';

export interface ParseData {
  code: ParsedComponent[];
  state: ParseState;
}

export interface ParseState {
  components: any,
  stylesheet: ReactComponent['styles'],
  primitives: Set<string>,
  libraries: Set<string>,
}

export interface ParsedComponent {
  id: string,
  tag: string,
  name: string,
  slug: string,
  props?: any,
  styles?: Record<string, any>,
  children?: ParsedComponent[],
  value?: string,
  paths?: any[],
  fills?: any[],
  box?: any,
}

export function parseNodes(nodes: TargetNode[], state?: ParseState) {
  // Init state if none yet
  if (!state) {
    state = {
      components: {},
      stylesheet: {},
      primitives: new Set(),
      libraries: new Set(),
    };
  }

  // Lines of codes will be inserted here
  let code: ParsedComponent[] = [];

  // Loop through each direct child node
  // TODO: why is ".reverse()" needed sometimes?
  nodes.forEach((node) => {
    // Skip invisible nodes
    if ('visible' in node && !node.visible) return;

    // Create component
    const id = node.id;
    const tag = getTag(node.type);
    const name = getName(node.name);
    const slug = getSlug(node.name);
    const component: ParsedComponent = {id, tag, name, slug};
  
    // Transform styles for child
    state.stylesheet[slug] = {tag, style: parseStyles(node)};

    // Parse Figma node depending on type
    switch (node.type) {

      // Text nodes get inserted and the primitive added
      case 'TEXT': {
        state.primitives.add('Text');
        code.push({...component, value: node.characters || ''});
        break;
      }
  
      // Image nodes get inserted, source saved, and the primitive added
      case 'IMAGE': {
        state.primitives.add('Image');
        break;
      }

      // Vectors get inserted w/ paths, fills, dimensions, paths. Add RNSVG library.
      case 'VECTOR':
      case 'LINE':
      case 'STAR':
      case 'ELLIPSE':
      case 'POLYGON':
      case 'BOOLEAN_OPERATION': {
        state.libraries.add('react-native-svg');
        code.push({...component, paths: node.vectorPaths, fills: node.fills, box: node.absoluteBoundingBox});
        break;
      }

      // Instances get inserted w/ props and master component is recorded
      case 'INSTANCE': {
        const isVariant = !!node.variantProperties;
        const parent = isVariant ? node.masterComponent.parent : node.mainComponent;
        state.components[parent.id] = parent;
        code.push({...component, tag: getName(node.name), props: node.componentProperties});
        break;
      }

      // Group nodes get recursed and inserted, styles and components are aggregated
      case 'GROUP':
      case 'FRAME':
      case 'COMPONENT': {
        const subnodes = parseNodes([...node.children], state);
        code.push({...component, children: subnodes.code});
        state = {
          components: {...state.components, ...subnodes.state.components},
          stylesheet: {...state.stylesheet, ...subnodes.state.stylesheet},
          primitives: new Set([...state.primitives, ...subnodes.state.primitives]),
          libraries: new Set([...state.libraries, ...subnodes.state.libraries]),
        };
        break;
      }

      default: {
        console.warn('UNSUPPORTED NODE', node.type, node);
      }
    }
  });

  // Return lines of code, primitives, styles, and components
  return {code, state};
}
