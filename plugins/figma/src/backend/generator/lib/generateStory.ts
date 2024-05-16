import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {sortProps, getPropName, getPage} from 'backend/parser/lib';
import {writePropImports} from './writePropImports';

import type {ProjectSettings} from 'types/settings';

export function generateStory(
  target: ComponentNode,
  isVariant: boolean,
  propDefs: ComponentPropertyDefinitions,
  settings: ProjectSettings,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const masterNode = isVariant ? target.parent : target;
  const componentName = createIdentifierPascal(masterNode.name);

  writeImports(writer, propDefs, componentName);
  writer.blankLine();
  writeMetaData(writer, target, isVariant);
  writer.blankLine();
  writeStories(writer, target, propDefs, isVariant, componentName);
  writer.writeLine('export default meta;');

  return writer.toString();
}

function writeImports(
  writer: CodeBlockWriter,
  propDefs: ComponentPropertyDefinitions,
  componentName: string,
) {
  // Import Component
  writer.write(`import {${componentName} as Component} from`);
  writer.space();
  writer.quote(`components/${componentName}`);
  writer.write(';');
  writer.newLine();
    
  // Import Prop Components (if any)
  writePropImports(writer, propDefs);

  // Boilerplate
  writer.write('import type {StoryObj, Meta} from');
  writer.space();
  writer.quote('@storybook/react');
  writer.write(';');
  writer.newLine();
  writer.blankLine();
  writer.writeLine('type Story = StoryObj<typeof Component>;');
}

function writeMetaData(
  writer: CodeBlockWriter,
  target: ComponentNode,
  isVariant: boolean,
) {
  const componentPage = getPage(target);
  writer.write('const meta: Meta<typeof Component> = ').inlineBlock(() => {
    writer.write('title:');
    writer.space();
    writer.quote(componentPage.name + '/' + (isVariant ? target.parent.name : target.name));
    writer.write(',');
    writer.newLine();
    writer.writeLine('component: Component,');
  });
  writer.write(';');
}

function writeStories(
  writer: CodeBlockWriter,
  target: ComponentNode,
  propDefs: ComponentPropertyDefinitions,
  isVariant: boolean,
  componentName: string,
) {
  // Single Story
  if (!isVariant) {
    writer.write(`export const ${componentName}: Story = `).inlineBlock(() =>
      writeProps(writer, propDefs));
    writer.write(';');
    writer.blankLine();

  // Multiple Stories (variants)
  } else {
    let defaultVariant: string;
    target.parent.children.forEach(child => {
      const variant = createIdentifierPascal(child.name.split(', ').map((n: string) => n.split('=').pop()).join(''));
      writer.write(`export const ${variant}: Story = `).inlineBlock(() => {
        if (!defaultVariant) defaultVariant = variant;
        if (variant === defaultVariant) {
          writeProps(writer, propDefs);
        } else {
          const props = Object.entries((child as VariantMixin).variantProperties);
          writePropsVariant(writer, props, defaultVariant);
        }
      });
      writer.write(';');
      writer.blankLine();
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
  props: Array<[string, string]>,
  defaultVariant: string,
) {
  writer.write('args: ').inlineBlock(() => {
    writer.writeLine(`...${defaultVariant}.args,`);
    if (props.length === 0) return;
    props.forEach(([k, v]) => {
        writer.write(`${k}:`);
        writer.space();
        writer.quote(v);
        writer.write(',');
        writer.newLine();
    });
  });
}
