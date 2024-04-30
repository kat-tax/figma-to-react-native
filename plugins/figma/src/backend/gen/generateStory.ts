import CodeBlockWriter from 'code-block-writer';
import {sortProps, getPropName, getPage} from 'backend/fig/lib';
import {createIdentifierPascal} from 'common/string';

import type {ProjectSettings} from 'types/settings';

export function generateStory(
  target: ComponentNode,
  isVariant: boolean,
  props: ComponentPropertyDefinitions,
  settings: ProjectSettings,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const masterNode = isVariant ? target.parent : target;
  const componentName = createIdentifierPascal(masterNode.name);
  const componentPage = getPage(target);

  // Import Component
  writer.write(`import {${componentName} as Component} from`);
  writer.space();
  writer.quote(`components/${componentName}`);
  writer.write(';');
  writer.newLine();
    
  // Import Prop Components (if any)
  writePropComponentImports(writer, props);

  // Boilerplate
  writer.write('import type {StoryObj, Meta} from');
  writer.space();
  writer.quote('@storybook/react');
  writer.write(';');
  writer.newLine();
  writer.blankLine();
  writer.writeLine('type Story = StoryObj<typeof Component>;');
  writer.blankLine();

  // Metadata
  writer.write('const meta: Meta<typeof Component> = ').inlineBlock(() => {
    writer.write('title:');
    writer.space();
    writer.quote(componentPage.name + '/' + (isVariant ? target.parent.name : target.name));
    writer.write(',');
    writer.newLine();
    writer.writeLine('component: Component,');
  });
  writer.write(';');
  writer.blankLine();

  // Single Story
  if (!isVariant) {
    writer.write(`export const ${componentName}: Story = `).inlineBlock(() =>
      writeProps(writer, props));
    writer.write(';');
    writer.blankLine();

  // Multiple Stories (variants)
  } else {
    let defaultVariantName: string;
    target.parent.children.forEach((child: any) => {
      const variantName = createIdentifierPascal(child.name.split(', ').map((n: string) => n.split('=').pop()).join(''));
      writer.write(`export const ${variantName}: Story = `).inlineBlock(() => {
        if (!defaultVariantName) defaultVariantName = variantName;
        if (variantName === defaultVariantName) {
          writeProps(writer, props);
        } else {
          writePropsVariant(writer, props, variantName, defaultVariantName);
        }
      });
      writer.write(';');
      writer.blankLine();
    });
  }

  // Default export
  writer.writeLine('export default meta;');

  return writer.toString();
}

// TODO: generalize instance swap imports
function writePropComponentImports(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
) {
  const props = propDefs ? Object.entries(propDefs) : [];
  const components: ComponentNode[] = [];

  // No props, no imports
  if (props.length === 0) return;

  // Look for sub-components in props
  props?.sort(sortProps).forEach(([_key, prop]) => {
    const {type, value, defaultValue}: any = prop;
    if (type === 'INSTANCE_SWAP') {
      const component = figma.getNodeById(value || defaultValue) as ComponentNode;
      components.push(component);
    }
  });

  // Loop through sub-components, import each one
  if (components.length > 0) {
    components.forEach((component) => {
      const name = createIdentifierPascal(component.name);
      writer.write(`import {${name}} from`);
      writer.space();
      writer.quote(`components/${name}`);
      writer.write(';');
      writer.newLine();
    });
  }
}

function writeProps(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
) {
  const props = propDefs ? Object.entries(propDefs) : [];
  if (props.length > 0) {
    writer.write('args: ').inlineBlock(() => {
      props.sort(sortProps).forEach(([key, prop]) => {
        const {type, defaultValue} = prop;
        const value = defaultValue.toString();
        const name = getPropName(key);
        // String or state
        if (type === 'TEXT' || type === 'VARIANT') {
          writer.write(`${name}:`);
          writer.space();
          writer.quote(value);
          writer.write(',');
          writer.newLine();
        // Component
        // TODO: generalize instance swap handling
        } else if (type === 'INSTANCE_SWAP') {
          const component = figma.getNodeById(value);
          const tagName = '<' + (createIdentifierPascal(component.name) || 'View') + '/>';
          writer.writeLine(`${name}: ${tagName},`);
        // Number or boolean
        } else {
          writer.writeLine(`${name}: ${value},`);
        }
      });
    });
    writer.write(',');
  } else {
    writer.writeLine('// ...');
  }
}

function writePropsVariant(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
  variant: string,
  defaultVariant: string,
) {
  const props = propDefs ? Object.entries(propDefs) : [];
  writer.write('args: ').inlineBlock(() => {
    writer.writeLine(`...${defaultVariant}.args,`);
    props.forEach(([key, prop]) => {
      const {type} = prop;
      const propName = getPropName(key);
      if (type === 'VARIANT') {
        writer.write(`${propName}:`);
        writer.space();
        writer.quote(variant);
        writer.write(',');
        writer.newLine();
      }
    });
  });
}
