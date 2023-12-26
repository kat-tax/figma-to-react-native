import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';

import {writeChildren} from './writeChildren';
import {writeClasses} from './writeClasses';
import {writeColors} from './writeColors';
import {writeProps} from './writeProps';
import {writeState} from './writeState';

import type {ParseData} from 'types/parse';
import type {Settings} from 'types/settings';
import type {ImportFlags} from './writeImports';

type StylePrefixMapper = (slug: string) => string;

export function writeFunction(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
  settings: Settings,
): ImportFlags {
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
  const isRootPressable = pressables !== null
    && pressables.find(e => e[1] === 'root' || !e[1]) !== undefined;

  // Component props
  writeProps(writer, flags, propDefs, name, pressables, isIcon, isRootPressable);

  // Component documentation
  if (masterNode.description) {
    writer.writeLine(`/**`);
    masterNode.description.split('\n').forEach((line: string) => {
      writer.writeLine(` * ${line.trim()}`);
    });
    if (masterNode?.documentationLinks?.length > 0) {
      writer.writeLine(` * @link ${masterNode.documentationLinks[0].uri}`);
    }
    writer.writeLine(` */`);
  }

  // Determine if style is conditional or static
  const getStylePrefix: StylePrefixMapper = (slug) => data?.variants
    && Object.keys(data.variants.classes).includes(slug)
      ? 'classes' : 'styles';

  // Component function body and children
  writer.write(`export function ${name}(props: ${name}Props)`).block(() => {

    // Write state hooks
    writeState(writer, flags, data);
    
    // Write style hook
    flags.unistyles.useStyles = true;
    writer.writeLine(`const {styles, theme} = useStyles(stylesheet);`);
    writer.blankLine();

    // Write variant conditionals
    if (isVariant && data?.variants) {
      if (Object.keys(data.variants.classes).length > 0)
        writeClasses(writer, flags, data, isRootPressable);
      if (Object.keys(data.variants.fills).length > 0)
        writeColors(writer, flags, data, isRootPressable);
    }

    /* TODO: accessibility
      if (isRootPressable) {
        writer.writeLine(`const ref = useRef(null);`);
        writer.writeLine(`const {buttonProps} = useButton(props);`);
        writer.writeLine(`const {hoverProps} = useHover({}, ref);`);
        writer.writeLine(`const {focusProps} = useFocusRing();`);
        writer.writeLine(`const ariaProps = {...buttonProps, ...hoverProps, ...focusProps};`);
        writer.blankLine();
      }
    */

    // Write component JSX
    writer.write(`return (`).indent(() => {
      const pressId = isRootPressable && pressables?.find(e => e[1] === 'root' || !e[1])?.[2];
      const rootTag = isRootPressable ? 'Pressable' : 'View';
      const rootStyle = ` style={${getStylePrefix('root')}.root}`;
      const rootTestID = ` testID={props.testID}`;
      const rootProps = isRootPressable
        ? ` onPress={props.${pressId}} disabled={_stateDisabled}` // TODO: ref={ref} {...ariaProps}
        : '';

      flags.reactNative[rootTag] = true;
      if (isRootPressable)
        flags.reactNativeTypes.PressableStateCallbackType = true;

      writer.write('<' + rootTag + rootStyle + rootProps + rootTestID + '>').indent(() => {
        writer.conditionalWriteLine(isRootPressable, `{(e: PressableStateCallbackType) => <>`);
        writer.withIndentationLevel((isRootPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
          writeChildren(
            writer,
            flags,
            data,
            settings,
            data.tree,
            getStylePrefix,
            pressables,
          );
        });
        writer.conditionalWriteLine(isRootPressable, `</>}`);
      });
      writer.writeLine(`</${rootTag}>`);
    });
    writer.writeLine(');');
  });

  writer.blankLine();
  return flags;
}
