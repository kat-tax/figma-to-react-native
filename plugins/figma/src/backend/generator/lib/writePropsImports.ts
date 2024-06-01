import {getComponentInfo, sortComponentProps} from 'backend/parser/lib';
import {PAGES_SPECIAL} from './consts';

import type CodeBlockWriter from 'code-block-writer';

// TODO:
// - handle assets
// - replace implementations w/ this function

export function writePropsImports(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
) {
  const components = getComponentImports(propDefs);
  let hasIconImport = false;

  // Loop through sub-components, import each one
  if (components.length > 0) {
    components.forEach(node => {
      const component = getComponentInfo(node);
      if (component.page.name === PAGES_SPECIAL.ICONS) {
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

  // Write icon import (if used)
  if (hasIconImport) {
    writer.write(`import {Icon} from`);
    writer.space();
    writer.quote('react-exo/icon');
    writer.write(';');
    writer.newLine();
  }

  return writer.toString();
}

function getComponentImports(propDefs: ComponentPropertyDefinitions) {
  const props = propDefs ? Object.entries(propDefs) : [];
  const components: BaseNode[] = [];

  // No props, no imports
  if (props.length === 0) return components;

  // Look for components in props
  props?.sort(sortComponentProps).forEach(([_key, prop]) => {
    const {type, defaultValue} = prop;
    if (type === 'INSTANCE_SWAP' && typeof defaultValue === 'string') {
      const node = figma.getNodeById(defaultValue);
      const component = getComponentInfo(node);
      components.push(node);
      if (component.propDefs) {
        const subComponents = getComponentImports(component.propDefs);
        if (subComponents.length > 0) {
          components.push(...subComponents);
        }
      }
    }
  });

  return components;
}

