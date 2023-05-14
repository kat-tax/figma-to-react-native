import * as utils from 'modules/fig/utils';
import {parseStyles} from 'modules/fig/styles';

import type * as T from 'types/parse';
import type {TargetNode} from 'types/figma';

export function parseNodes(nodes: TargetNode[], state?: T.ParseState): T.ParseData {
  // Init state (haven't recursed yet)
  if (!state) {
    state = {
      includes: {},
      components: {},
      stylesheet: {},
      primitives: new Set(),
      libraries: new Set(),
    };
  }

  // Lines of codes will be inserted here
  let code: T.ParsedComponent[] = [];

  // Loop through each direct child node
  nodes.forEach((node) => {
    const isVariant = !!node.variantProperties;
    const propRefs = isVariant
      ? node.parent.componentPropertyReferences
      : node.componentPropertyReferences;

    // Skip nodes that are not visible and not conditionally rendered
    if (!node.visible && !propRefs?.visible) {
      return;
    }

    // These node types can have styles
    const hasStyles = node.type === 'TEXT'
      || node.type === 'GROUP'
      || node.type === 'FRAME'
      || node.type === 'COMPONENT'
      || node.type === 'RECTANGLE'
      || node.type === 'ELLIPSE';

    // Create component
    const component: T.ParsedComponent = {
      node,
      id: node.id,
      tag: utils.getTag(node.type),
      name: utils.getName(node.name),
      slug: hasStyles && utils.getSlug(node.name),
    };
  
    // Transform styles for child (if applicable)
    if (component.slug) {
      state.stylesheet[component.slug] = {
        component,
        styles: parseStyles(node),
      };
    }

    switch (node.type) {
      // Group nodes get recursed & state is combined
      case 'GROUP':
      case 'FRAME':
      case 'COMPONENT': {
        const subnodes = parseNodes([...node.children], state);
        code.push({...component, children: subnodes.code});
        state = {
          includes: {...state.includes, ...subnodes.state.includes},
          components: {...state.components, ...subnodes.state.components},
          stylesheet: {...state.stylesheet, ...subnodes.state.stylesheet},
          primitives: new Set([...state.primitives, ...subnodes.state.primitives]),
          libraries: new Set([...state.libraries, ...subnodes.state.libraries]),
        };
        break;
      }

      // Instances get inserted w/ props and the master component recorded
      case 'INSTANCE': {
        const main = isVariant ? node.mainComponent.parent : node.mainComponent;
        const props = node.componentProperties;
        const propId = node.componentPropertyReferences?.mainComponent;
        const propName = propId ? utils.getSlug(propId.split('#').shift()) : null;
        // Explicit component (does not change)
        if (!propName) {
          code.push({...component, props, tag: utils.getName(node.name)});
          // Queue this component for import
          state.components[main.id] = main;
          // Also queue any component used in a prop
          Object.keys(props).forEach((key) => {
            const {type, value} = props[key];
            if (type === 'INSTANCE_SWAP') {
              const swapComponent = figma.getNodeById(value);
              state.components[swapComponent.id] = swapComponent;
            }
          });
        // Instance swapped component (changes based on prop)
        } else {
          code.push({...component, swap: propName});
          // Only include swapped components for bundles, not for code generation
          state.includes[main.id] = main;
        }
        break;
      }

      // Basic shapes get inserted (styles already handled)
      case 'RECTANGLE':
      case 'ELLIPSE': {
        code.push({...component});
        break;
      }

      // Text nodes get inserted and the primitive added
      case 'TEXT': {
        state.primitives.add('Text');
        const propId = propRefs?.characters;
        const propName = propId ? utils.getSlug(propId.split('#').shift()) : null;
        code.push({...component, value: propName ? `props.${propName}` : node.characters || ''});
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
        // node.parent.exportAsync({format: 'SVG_STRING'}).then(console.log);
        code.push({...component, paths: node.vectorPaths, fills: node.fills, box: node.absoluteBoundingBox});
        break;
      }

      default: {
        console.warn('parseNodes: UNSUPPORTED', node.type, node);
      }
    }
  });

  // Return lines of code, primitives, styles, and components
  return {code, state};
}
