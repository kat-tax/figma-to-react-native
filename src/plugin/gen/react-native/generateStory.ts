import CodeBlockWriter from 'code-block-writer';
import {sortProps, getPropName} from 'plugin/fig/lib';
import {createIdentifierPascal} from 'common/string';

import type {Settings} from 'types/settings';

export function generateStory(
  target: ComponentNode,
  isVariant: boolean,
  props: ComponentPropertyDefinitions,
  settings: Settings,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const masterNode = isVariant ? target.parent : target;
  const componentName = createIdentifierPascal(masterNode.name);
  const componentProps = props ? Object.entries(props) : [];

  // Import Component
  writer.write(`import {${componentName} as Component} from`);
  writer.space();
  writer.quote(`./${componentName}`);
  writer.write(';');
  writer.newLine();
    
  // Look through props for needed sub-components (if applicable)
  const components: ComponentNode[] = [];
  componentProps?.sort(sortProps).forEach(([_key, prop]) => {
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
      writer.quote(`./${name}`);
      writer.write(';');
      writer.newLine();
    });
  }

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
    writer.quote(isVariant ? target.parent.name : target.name);
    writer.write(',');
    writer.newLine();
    writer.writeLine('component: Component,');
  });
  writer.write(';');
  writer.blankLine();

  // Story
  if (!isVariant) {
    writer.write(`export const ${componentName}: Story = `).inlineBlock(() => {
      if (componentProps.length > 0) {
        writer.write('args: ').inlineBlock(() => {
          componentProps.sort(sortProps).forEach(([key, prop]) => {
            const {type, value, defaultValue}: any = prop;
            const name = getPropName(key);
            const val = value || defaultValue;
            // String or state
            if (type === 'TEXT' || type === 'VARIANT') {
              writer.write(`${name}:`);
              writer.space();
              writer.quote(val);
              writer.write(',');
              writer.newLine();
            // Component
            } else if (type === 'INSTANCE_SWAP') {
              const component = figma.getNodeById(val);
              const tagName = '<' + (createIdentifierPascal(component.name) || 'View') + '/>';
              writer.writeLine(`${name}: ${tagName},`);
            // Number or boolean or ???
            } else {
              writer.writeLine(`${name}: ${val},`);
            }
          });
        });
        writer.write(',');
      } else {
        writer.writeLine('// ...');
      }
    });
    writer.write(';');
    writer.blankLine();
  } else {
    // TODO: sort variants
    target.parent.children.forEach((child: any) => {
      const name = createIdentifierPascal(child.name.split(', ').map((n: string) => n.split('=').pop()).join(''));
      const props = componentProps?.sort(sortProps);
      writer.write(`export const ${name}: Story = `).inlineBlock(() => {
        writer.write('args: ').inlineBlock(() => {
          props.forEach(([key, prop]) => {
            const {type, defaultValue}: any = prop;
            const propName = getPropName(key);
            // String
            if (type === 'TEXT') {
              writer.write(`${propName}:`);
              writer.space();
              writer.quote(defaultValue);
              writer.write(',');
              writer.newLine();
            // State
            } else if (type === 'VARIANT') {
              writer.write(`${propName}:`);
              writer.space();
              writer.quote(name);
              writer.write(',');
              writer.newLine();
            // Component
            } else if (type === 'INSTANCE_SWAP') {
              const component = figma.getNodeById(defaultValue);
              const tagName = '<' + (createIdentifierPascal(component.name) || 'View') + '/>';
              writer.writeLine(`${propName}: ${tagName},`);
            // Number or boolean or ???
            } else {
              writer.writeLine(`${propName}: ${defaultValue.toString() || ''},`);
            }
          });
        });
        writer.write(',');
      });
      writer.write(';');
      writer.blankLine();
    });
  }

  // Default export
  writer.writeLine('export default meta;');

  return writer.toString();
}
