import CodeBlockWriter from 'code-block-writer';
import {isVariant, getNodeAttrs} from 'backend/parser/lib';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';

import {writePropsAttributes} from './writePropsAttributes';
import {writePropsInterface} from './writePropsInterface';
import {writeStateHooks} from './writeStateHooks';
import {writeStyleHooks} from './writeStyleHooks';
import {writeChildren} from './writeChildren';
import {writeTSDoc} from './writeTSDoc';

import type {ImportFlags} from './writeImports';
import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';
import type {ParseData} from 'types/parse';

export async function writeFunction(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
  settings: ProjectSettings,
  infoDb: Record<string, ComponentInfo> | null,
) {
  // Derived data
  const masterNode = (isVariant(data.root.node) ? data.root.node?.parent : data.root.node) as ComponentNode;
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

  const docWriter = new CodeBlockWriter(settings.writer);
  const tsdoc = writeTSDoc(docWriter, masterNode);
  writePropsInterface(writer, flags, tsdoc, propDefs, name, pressables, isPressable, isIcon);
  if (tsdoc?.value) writer.write(tsdoc.value);

  writer.write(`export function ${name}(props: ${name}Props)`).block(() => {
    const code = getComponentCode(flags, data, settings, masterNode, pressables, isPressable, infoDb);
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
  masterNode: ComponentNode,
  pressables: string[][],
  isPressable: boolean,
  infoDb: Record<string, ComponentInfo> | null,
) {
  const writer = new CodeBlockWriter(settings.writer);

  // Helper to determine the style prop value
  const getStyleProp = (
    slug: string,
    isPressable?: boolean,
    isRoot?: boolean,
  ) => data?.variants
    && Object.keys(data.variants.classes).includes(slug)
      ? `[vstyles.${slug}${isRoot && isPressable ? '' : `(${isPressable ? 'e' : ''})`}, props.style]`
      : isRoot
        ? `[styles.${slug}, props.style]`
        : `styles.${slug}`;

  // Helper to determine the icon prop value
  const getIconProp = (slug: string, isPressable?: boolean, isRoot?: boolean) => data?.variants
    && Object.keys(data.variants.icons).includes(slug)
      ? `vstyles.${slug}${isRoot && isPressable ? '' : `(${isPressable ? 'e' : ''})`}`
      : `styles.${slug}`;

  // Write component JSX
  writer.write(`return (`).indent(() => {
    const attributes = getNodeAttrs(masterNode);

    // Determine if motion component
    let hasMotion = false;
    if (attributes.motions?.length) {
      flags.exoMotion.Motion = true;
      hasMotion = true;
    }

    // Determine the JSX tag
    const tag = hasMotion
      ? 'Motion.View'
      : isPressable
        ? 'Pressable'
        : 'View';

    // Generate the JSX props
    const props = writePropsAttributes(new CodeBlockWriter(settings.writer), {
      props: undefined,
      infoDb,
      nodeId: masterNode.id,
      styleProp: getStyleProp('root', isPressable, true),
      attrProps: attributes?.properties,
      motionProps: attributes?.motions,
      isRoot: true,
    });

    // Import flags (if not motion)
    if (!hasMotion) {
      flags.reactNative[tag] = true;
    }

    // Write root JSX
    writer.write(`<${tag}${isPressable ? `${props} {...props}` : props.trimEnd()}>`).indent(() => {
      writer.conditionalWriteLine(isPressable, `{e => <>`);
      writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChildren(writer, data.tree, {
          data,
          flags,
          infoDb,
          settings,
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

