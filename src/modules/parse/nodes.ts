import {parseStyles} from 'modules/parse/style';
import {getTag, getName, getSlug} from 'utils/figma';

import type {TargetNode} from 'types/figma';
import type {ReactComponent} from 'types/react';

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

export function parseNodes(children: TargetNode[], state?: ParseState) {
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
  children.forEach((child) => {

    // Create identifiers
    const id = child.id;
    const tag = getTag(child.type);
    const name = getName(child.name);
    const slug = getSlug(child.name);
    const node: ParsedComponent = {id, tag, name, slug};
  
    // Transform styles for child
    state.stylesheet[slug] = {tag, style: parseStyles(child)};

    // Parse Figma node depending on type
    switch (child.type) {

      // Text nodes get inserted and the primitive added
      case 'TEXT': {
        state.primitives.add('Text');
        code.push({...node, value: child.characters || ''});
        break;
      }
  
      // Image nodes get inserted, source saved, and the primitive added
      case 'IMAGE': {
        state.primitives.add('Image');
        break;
      }

      // Vectors get inserted w/ paths, fills, dimensions, paths. Add RNSVG library.
      case 'VECTOR': {
        state.libraries.add('react-native-svg');
        code.push({...node, paths: child.vectorPaths, fills: child.fills, box: child.absoluteBoundingBox});
        break;
      }

      // Instances get inserted w/ props and master component is recorded
      case 'INSTANCE': {
        const isVariant = !!child.variantProperties;
        const parent = isVariant ? child.masterComponent.parent : child.mainComponent;
        state.components[parent.id] = parent;
        code.push({...node, tag: getName(child.name), props: child.componentProperties});
        break;
      }

      // Group nodes get recursed and inserted, styles and components are aggregated
      case 'GROUP':
      case 'FRAME':
      case 'COMPONENT': {
        const subnodes = parseNodes([...child.children], state);
        code.push({...node, children: subnodes.code});
        state = {
          components: {...state.components, ...subnodes.state.components},
          stylesheet: {...state.stylesheet, ...subnodes.state.stylesheet},
          primitives: new Set([...state.primitives, ...subnodes.state.primitives]),
          libraries: new Set([...state.libraries, ...subnodes.state.libraries]),
        };
        break;
      }

      default: {
        console.warn('UNSUPPORTED NODE', child.type, child);
      }
    }
  });

  // Return lines of code, primitives, styles, and components
  return {code, state};
}
