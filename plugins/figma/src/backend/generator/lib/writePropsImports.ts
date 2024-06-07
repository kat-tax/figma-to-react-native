import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';

import type CodeBlockWriter from 'code-block-writer';

export function writePropsImports(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
  skipIconImport?: boolean,
) {
  const components = getComponentImports(propDefs);
  let hasIconImport = false;

  // No imports, return null
  if (components.length === 0) return null;

  // Loop through sub-components, import each one
  if (components.length > 0) {
    components.forEach(node => {
      const component = parser.getComponentInfo(node);
      if (component.page.name === consts.PAGES_SPECIAL.ICONS) {
        hasIconImport = true;
        return;
      }
      writer.write(`import {${component.name}} from`);
      writer.space();
      writer.quote(component.path);
      writer.write(';');
      writer.newLine();
    });
  }

  // Write icon import (if used and not already imported)
  if (hasIconImport && !skipIconImport) {
    writer.write(`import {Icon} from`);
    writer.space();
    writer.quote('react-exo/icon');
    writer.write(';');
    writer.newLine();
  }

  return writer.toString();
}

function getComponentImports(propDefs: ComponentPropertyDefinitions, components: BaseNode[] = []) {
  const props = propDefs ? Object.entries(propDefs) : [];

  // No props, no imports
  if (props.length === 0) return components;

  // Look for components in props
  props?.sort(parser.sortComponentProps).forEach(([_key, prop]) => {
    const {type, defaultValue} = prop;
    if (type === 'INSTANCE_SWAP' && typeof defaultValue === 'string') {
      const node = figma.getNodeById(defaultValue);
      const component = parser.getComponentInfo(node);
      components.push(node);
      if (component.propDefs) {
        return getComponentImports(component.propDefs, components);
      }
    }
  });

  return components;
}

