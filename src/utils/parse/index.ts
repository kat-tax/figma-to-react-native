import {parseStyles} from 'utils/parse/style';
import {getTag, getName, getSlug} from 'utils/parse/helpers';

import type {ReactComponent} from 'types/react';

export interface ParseState {
  components: any,
  stylesheet: ReactComponent['styles'],
  primitives: Set<string>,
  libraries: Set<string>,
}

export interface ParseCode {
  tag: string,
  slug?: string,
  props?: any,
  children?: ParseCode[],
  value?: string,
  paths?: any[],
  fills?: any[],
  box?: any,
}

export default function parse(children: any[], state?: ParseState) {
  // Init state if missing
  if (!state) {
    state = {
      components: {},
      stylesheet: {},
      primitives: new Set(),
      libraries: new Set(),
    };
  }

  // Lines of codes will be inserted here
  let code: ParseCode[] = [];

  // Loop through each direct child node
  children.reverse().forEach((child: any) => {

    // Create identifiers
    const tag = getTag(child.type);
    const slug = getSlug(child.name);
  
    // Transform styles for child
    state.stylesheet[slug] = {tag, style: parseStyles(child)};

    // Parse Figma node depending on type
    switch (child.type) {

      // Text nodes get inserted and the primitive added
      case 'TEXT': {
        state.primitives.add('Text');
        code.push({slug, tag: 'Text', value: child.characters || ''});
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
        code.push({tag: 'Svg', paths: child.vectorPaths, fills: child.fills, box: child.absoluteBoundingBox});
        break;
      }

      // Instances get inserted w/ props and master component is recorded
      case 'INSTANCE': {
        const isVariant = !!child.variantProperties;
        const parent = isVariant ? child.masterComponent.parent : child.masterComponent;
        state.components[parent.id] = parent;
        code.push({tag: getName(child.name), props: child.componentProperties});
        break;
      }

      // Group nodes get recursed and inserted, styles and components are aggregated
      case 'GROUP':
      case 'FRAME': {
        const subnodes = parse([...child.children], state);
        code.push({slug, tag: 'View', children: subnodes.code});
        state = {
          components: {...state.components, ...subnodes.state.components},
          stylesheet: {...state.stylesheet, ...subnodes.state.stylesheet},
          primitives: new Set([...state.primitives, ...subnodes.state.primitives]),
          libraries: new Set([...state.libraries, ...subnodes.state.libraries]),
        };
        break;
      }

      default: {
        console.warn('UNSUPPORTED NODE', child);
      }
    }
  });

  // Return lines of code, primitives, styles, and components
  return {code, state};
}
