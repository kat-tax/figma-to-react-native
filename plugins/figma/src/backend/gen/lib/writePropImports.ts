import {sortProps} from 'backend/fig/lib';
import {createIdentifierPascal} from 'common/string';

import type CodeBlockWriter from 'code-block-writer';

// TODO:
// - handle icons
// - handle assets
// - replace implementations w/ this function

export function writePropImports(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
) {
  const props = propDefs ? Object.entries(propDefs) : [];
  const components: BaseNode[] = [];

  // No props, no imports
  if (props.length === 0) return;

  // Look for sub-components in props
  props?.sort(sortProps).forEach(([_key, prop]) => {
    const {type, defaultValue} = prop;
    if (type === 'INSTANCE_SWAP' && typeof defaultValue === 'string') {
      const component = figma.getNodeById(defaultValue);
      components.push(component);
    }
  });

  // Loop through sub-components, import each one
  if (components.length > 0) {
    components.forEach(component => {
      const name = createIdentifierPascal(component.name);
      writer.write(`import {${name}} from`);
      writer.space();
      writer.quote(`components/${name}`);
      writer.write(';');
      writer.newLine();
    });
  }
}
