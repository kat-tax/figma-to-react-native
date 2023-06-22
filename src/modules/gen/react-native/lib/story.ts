import CodeBlockWriter from 'code-block-writer';
import {sortProps, getSlug, getName} from 'modules/fig/utils';

import type {ParsedComponent} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateStory(root: ParsedComponent, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const isVariant = !!root.node?.variantProperties;
  
  let nodeProps: any;
  try {
    nodeProps = Object.entries(isVariant
      ? root.node?.parent?.componentPropertyDefinitions
      : root.node.componentPropertyDefinitions)
  } catch (e) {
    nodeProps = [];
  }

  // Import Component
  writer.write(`import {${root.name} as Component} from`);
  writer.space();
  writer.quote(`./${root.name}`);
  writer.write(';');
  writer.newLine();
    
  // Look through props for needed sub-components (if applicable)
  const components: BaseNode[] = [];
  nodeProps?.sort(sortProps).forEach(([_key, prop]) => {
    const {type, value, defaultValue}: any = prop;
    if (type === 'INSTANCE_SWAP') {
      const component = figma.getNodeById(value || defaultValue);
      components.push(component);
    }
  });

  // Loop through sub-components, import each one
  if (components.length > 0) {
    components.forEach((component) => {
      const name = getName(component.name);
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
    writer.quote(isVariant ? root.node.parent.name : root.node.name);
    writer.write(',');
    writer.newLine();
    writer.writeLine('component: Component,');
  });
  writer.write(';');
  writer.blankLine();

  // Story
  if (!isVariant) {
    writer.write(`export const ${root.name}: Story = `).inlineBlock(() => {
      if (nodeProps.length > 0) {
        writer.write('args: ').inlineBlock(() => {
          nodeProps.sort(sortProps).forEach(([key, prop]) => {
            const {type, value, defaultValue}: any = prop;
            const name = getSlug(key.split('#').shift());
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
              const tagName = '<' + (getName(component.name) || 'View') + '/>';
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
    root.node.parent.children.forEach((child: any) => {
      const name = getName(child.name.split(', ').map((n: string) => n.split('=').pop()).join(''));
      const props = nodeProps?.sort(sortProps);
      writer.write(`export const ${name}: Story = `).inlineBlock(() => {
        writer.write('args: ').inlineBlock(() => {
          props.forEach(([key, prop]) => {
            const {type, defaultValue}: any = prop;
            const propName = getSlug(key.split('#').shift());
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
              const tagName = '<' + (getName(component.name) || 'View') + '/>';
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
