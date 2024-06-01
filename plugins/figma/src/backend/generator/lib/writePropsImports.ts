import {getComponentInfo, sortComponentProps} from 'backend/parser/lib';
import type CodeBlockWriter from 'code-block-writer';

// TODO:
// - handle icons
// - handle assets
// - replace implementations w/ this function

export function writePropsImports(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
) {
  const props = propDefs ? Object.entries(propDefs) : [];
  const components: BaseNode[] = [];

  // No props, no imports
  if (props.length === 0) return;

  // Look for sub-components in props
  // TODO: recurse through deeper sub-components
  props?.sort(sortComponentProps).forEach(([_key, prop]) => {
    const {type, defaultValue} = prop;
    if (type === 'INSTANCE_SWAP' && typeof defaultValue === 'string') {
      const component = figma.getNodeById(defaultValue);
      components.push(component);
    }
  });

  // Loop through sub-components, import each one
  if (components.length > 0) {
    components.forEach(node => {
      const component = getComponentInfo(node);
      writer.write(`import {${component.name}} from`);
      writer.space();
      writer.quote(component.path);
      writer.write(';');
      writer.newLine();
    });
  }
}
