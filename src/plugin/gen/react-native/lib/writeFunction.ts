import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';
import {getPropName, sortPropsDef} from 'plugin/fig/lib';
import {writeChildren} from './writeChildren';
import {writeClasses} from './writeClasses';
import {writeState} from './writeState';

import type {ParseData} from 'types/parse';
import type {Settings} from 'types/settings';

type StylePrefixMapper = (slug: string) => string;

export function writeFunction(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  metadata: {
    stylePrefix: string,
    isPreview?: boolean,
  },
  includeFrame?: boolean,
) {
  // Derived data
  const isVariant = !!(data.root.node as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? data.root.node?.parent : data.root.node) as ComponentNode;
  const propDefs = (masterNode as ComponentNode)?.componentPropertyDefinitions;
  const props = propDefs ? Object.entries(propDefs) : [];
  const name = createIdentifierPascal(masterNode.name);
  const isIcon = name.startsWith('Icon');
  const hasProps = props.length > 0 || isIcon;
  
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
  if (hasProps) {
    writer.write(`export interface ${name}Props`).block(() => {
      // Figma props
      let hasWroteDisableProp = false;
      props.sort(sortPropsDef).forEach(([key, prop]) => {
        const propName = getPropName(key);

        if (propName === 'disabled') {
          if (hasWroteDisableProp) return;
          hasWroteDisableProp = true;
        }

        const isBoolean = prop.type === 'BOOLEAN';
        const isVariant = prop.type === 'VARIANT';
        const isInstanceSwap = prop.type === 'INSTANCE_SWAP';
        const isRootPressableState = propName === 'state' && isRootPressable && isVariant;
        const isConditionalProp = isBoolean || isInstanceSwap || isRootPressableState;
        const propCond = isConditionalProp ? '?' : '';
        const propType: string = isVariant
          ? prop.variantOptions
            .map((v) => `'${createIdentifierPascal(v)}'`)
            .join(' | ')
          : isInstanceSwap
            ? `ReactElement`
            : prop.type === 'TEXT'
              ? 'string'
              : prop.type.toLowerCase();

        writer.writeLine(`${propName}${propCond}: ${propType},`);

        // Write disabled prop if needed (special use case)
        if (isRootPressableState && !hasWroteDisableProp) {
          writer.writeLine(`disabled?: boolean,`);
          hasWroteDisableProp = true;
        }
      });

      // Custom props
      pressables?.forEach(([,,id]) => {
        writer.writeLine(`${id}?: (e: GestureResponderEvent) => void,`);
      });

      // Icon props
      if (isIcon) {
        writer.writeLine(`color?: string,`);
      }
    });
    writer.blankLine();
  }

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
      ? '$styles' : 'styles';

  // Component function body and children
  const attrProps = `${hasProps ? `props: ${name}Props` : ''}`;
  writer.write(`export function ${name}(${attrProps})`).block(() => {
    // Write state hooks
    writeState(writer, data);
    // Write style hook
    writer.writeLine(`const {styles} = useStyles(${metadata.stylePrefix});`);
    writer.blankLine();

    // Conditional styling
    if (isVariant && data?.variants && Object.keys(data.variants.classes).length > 0)
      writeClasses(writer, data, isRootPressable);

    /* TODO: accessibility
      if (isRootPressable) {
        writer.writeLine(`const ref = React.useRef(null);`);
        writer.writeLine(`const {buttonProps} = useButton(props);`);
        writer.writeLine(`const {hoverProps} = useHover({}, ref);`);
        writer.writeLine(`const {focusProps} = useFocusRing();`);
        writer.writeLine(`const ariaProps = {...buttonProps, ...hoverProps, ...focusProps};`);
        writer.blankLine();
      }
    */

    writer.write(`return (`).indent(() => {
      const pressId = isRootPressable && pressables?.find(e => e[1] === 'root' || !e[1])?.[2];
      const rootTag = isRootPressable ? 'Pressable' : 'View';
      const rootStyle = ` style={${getStylePrefix('root')}.root}`;
      const rootProps = isRootPressable
        ? ` onPress={props.${pressId}} disabled={_stateDisabled}` // TODO: ref={ref} {...ariaProps}
        : '';
      writer.conditionalWrite(includeFrame, `<View style={${getStylePrefix('frame')}.frame}>`).indent(() => {
        writer.withIndentationLevel(includeFrame ? 0 : -1 + writer.getIndentationLevel(), () => {
          writer.write('<' + rootTag + rootStyle + rootProps + '>').indent(() => {
            writer.conditionalWriteLine(isRootPressable, `{(e: PressableStateCallbackType) => <>`);
            writer.withIndentationLevel((isRootPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
              writeChildren(
                writer,
                data,
                settings,
                data.tree,
                getStylePrefix,
                metadata.isPreview,
                pressables,
              );
            });
            writer.conditionalWriteLine(isRootPressable, `</>}`);
          });
          writer.writeLine(`</${rootTag}>`);
        });
      });
      writer.conditionalWriteLine(includeFrame, `</View>`);
    });
    writer.writeLine(');');
  });
}
