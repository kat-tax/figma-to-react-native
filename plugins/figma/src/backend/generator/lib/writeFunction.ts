import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';

import {writeChildren} from './writeChildren';
import {writeStyles} from './writeStyles';
import {writeProps} from './writeProps';
import {writeState} from './writeState';
import {writeDocs} from './writeDocs';

import type {ParseData} from 'types/parse';
import type {ProjectSettings} from 'types/settings';
import type {ImportFlags} from './writeImports';

export function writeFunction(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
  settings: ProjectSettings,
) {
  // Derived data
  const isVariant = !!(data.root.node as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? data.root.node?.parent : data.root.node) as ComponentNode;
  const propDefs = (masterNode as ComponentNode)?.componentPropertyDefinitions;
  const name = createIdentifierPascal(masterNode.name);
  const isIcon = name.startsWith('Icon');

  // Pressable data (on click -> open link set)
  const pressables = data.root?.click?.type === 'URL'
    ? data.root.click.url?.split(',')?.map(s => s?.trim()?.split('#'))?.map(([prop, label]) => {
        const id = createIdentifierCamel(label && label !== 'root' && prop === 'onPress'
          ? `${prop}_${label}`
          : prop
        );
        return [prop, label, id];
      })
    : null;

  // Determine if root node is wrapped in a pressable
  const isPressable = pressables !== null
    && pressables.find(e => e[1] === 'root' || !e[1]) !== undefined;

  writeProps(writer, flags, propDefs, name, pressables, isPressable, isIcon);
  writeDocs(writer, masterNode);
  writer.write(`export function ${name}(props: ${name}Props)`).block(() => {
    writeState(writer, flags, data);
    writeStyles(writer, flags, name, data.variants);

    // Helper to determine the style prop value
    const getStyleProp = (slug: string, isDynamic?: boolean) => data?.variants
      && Object.keys(data.variants.classes).includes(slug)
        ? `vstyles.${slug}(${isDynamic ? 'e' : ''})`
        : `styles.${slug}`;

    // Write component JSX
    writer.write(`return (`).indent(() => {
      const tag = isPressable ? 'Pressable' : 'View';
      const props = isPressable ? ` {...props}` : ' testID={props.testID}';
      const style = ` style={${getStyleProp('root')}}`;

      // Import flags
      flags.reactNative[tag] = true;

      // Write root JSX
      writer.write('<' + tag + style + props + '>').indent(() => {
        writer.conditionalWriteLine(isPressable, `{e => <>`);
        writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
          writeChildren(
            writer,
            flags,
            data,
            settings,
            data.tree,
            getStyleProp,
            pressables,
          );
        });
        writer.conditionalWriteLine(isPressable, `</>}`);
      });
      writer.writeLine(`</${tag}>`);
    });
    writer.writeLine(');');
  });

  writer.blankLine();
}
