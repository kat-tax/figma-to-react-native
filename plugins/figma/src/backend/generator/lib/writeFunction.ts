import CodeBlockWriter from 'code-block-writer';
import * as string from 'common/string';
import * as node from 'backend/parser/lib';

import {writePropsInterface} from './writePropsInterface';
import {writeStateHooks} from './writeStateHooks';
import {writeStyleHooks} from './writeStyleHooks';
import {writeChildren} from './writeChildren';
import {writeTSDoc} from './writeTSDoc';

import type {ImportFlags} from './writeImports';
import type {ProjectSettings} from 'types/settings';
import type {ParseData} from 'types/parse';

export async function writeFunction(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
  settings: ProjectSettings,
  language: VariableCollection,
) {
  // Derived data
  const isVariant = node.isVariant(data.root.node);
  const masterNode = (isVariant ? data.root.node?.parent : data.root.node) as ComponentNode;
  const propDefs = (masterNode as ComponentNode)?.componentPropertyDefinitions;
  const name = string.createIdentifierPascal(masterNode.name);
  const isIcon = name.startsWith('Icon');

  // Pressable data (on click -> open link set)
  const pressables = data.root?.click?.type === 'URL'
    ? data.root.click.url?.split(',')?.map(s => s?.trim()?.split('#'))?.map(([prop, label]) => {
        const id = string.createIdentifierCamel(label && label !== 'root' && prop === 'onPress'
          ? `${prop}_${label}`
          : prop
        );
        return [prop, label, id];
      })
    : null;

  // Determine if root node is wrapped in a pressable
  const isPressable = pressables !== null
    && pressables.find(e => e[1] === 'root' || !e[1]) !== undefined;

  const docWriter = new CodeBlockWriter(settings.writer);
  const tsdoc = writeTSDoc(docWriter, masterNode);
  writePropsInterface(writer, flags, tsdoc, propDefs, name, pressables, isPressable, isIcon);
  if (tsdoc?.value) writer.write(tsdoc.value);

  writer.write(`export function ${name}(props: ${name}Props)`).block(() => {
    const code = getComponentCode(flags, data, settings, language, masterNode, pressables, isPressable);
    writeStateHooks(writer, flags, data);
    writeStyleHooks(writer, flags, name, data.variants);
    writer.write(code);
  });

  writer.blankLine();
}

function getComponentCode(
  flags: ImportFlags,
  data: ParseData,
  settings: ProjectSettings,
  language: VariableCollection,
  masterNode: ComponentNode,
  pressables: string[][],
  isPressable: boolean,
) {
  const writer = new CodeBlockWriter(settings.writer);

  // Helper to determine the style prop value
  const getStyleProp = (slug: string, isPressable?: boolean, isRoot?: boolean) => data?.variants
    && Object.keys(data.variants.classes).includes(slug)
      ? `vstyles.${slug}${isRoot && isPressable ? '' : `(${isPressable ? 'e' : ''})`}`
      : `styles.${slug}`;
  
  // Helper to determine the icon prop value
  const getIconProp = (slug: string, isPressable?: boolean, isRoot?: boolean) => data?.variants
    && Object.keys(data.variants.icons).includes(slug)
      ? `vstyles.${slug}${isRoot && isPressable ? '' : `(${isPressable ? 'e' : ''})`}`
      : `styles.${slug}`;

  // Write component JSX
  writer.write(`return (`).indent(() => {
    const tag = isPressable ? 'Pressable' : 'View';
    const testId = ` testID={props.testID ?? "${masterNode.id}"}`;
    const props = isPressable ? `${testId} {...props}` : testId;
    const style = ` style={${getStyleProp('root', isPressable, true)}}`;

    // Import flags
    flags.reactNative[tag] = true;

    // Write root JSX
    writer.write('<' + tag + style + props + '>').indent(() => {
      writer.conditionalWriteLine(isPressable, `{e => <>`);
      writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChildren(writer, data.tree, {
          data,
          flags,
          settings,
          language,
          pressables,
          getIconProp,
          getStyleProp,
        });
      });
      writer.conditionalWriteLine(isPressable, `</>}`);
    });
    writer.writeLine(`</${tag}>`);
  });
  writer.writeLine(');');

  return writer.toString();
}

