import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {round} from 'common/number';
import {translate} from 'backend/utils/translate';
import * as parser from 'backend/parser/lib';
import {writePropsAttributes} from './writePropsAttributes';
import {PAGES_SPECIAL} from './consts';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/parse';
import type {ProjectSettings} from 'types/settings';
import type {ImportFlags} from './writeImports';

type StylePrefixMapper = (slug: string, isDynamic: boolean) => string;
type WriteChildrenState = {
  flags: ImportFlags,
  data: ParseData,
  settings: ProjectSettings,
  language: VariableCollection,
  pressables?: string[][],
  getStyleProp: StylePrefixMapper,
  getIconProp: StylePrefixMapper,
}

export function writeChildren(
  writer: CodeBlockWriter,
  children: ParseNodeTree,
  state: WriteChildrenState,
) {
  for (const child of children) {
    const slug = state.data.children?.find(c => c.node === child.node)?.slug;
    const pressId = state.pressables?.find(e => e?.[1] === slug)?.[2];
    const isVariant = !!(child.node as SceneNode & VariantMixin).variantProperties;
    const masterNode = isVariant ? child.node.parent : child.node;
    const propRefs = (masterNode as SceneNode)?.componentPropertyReferences;
    const isPressable = Boolean(pressId);
    const isConditional = Boolean(propRefs?.visible);
    if (isPressable)
      state.flags.reactNative.Pressable = true;
    writer.conditionalWriteLine(isConditional, `{props.${parser.getComponentPropName(propRefs?.visible)} && `);
    writer.withIndentationLevel((isConditional ? 1 : 0) + writer.getIndentationLevel(), () => {
      writer.conditionalWriteLine(isPressable, `<Pressable onPress={props.${pressId}}>`);
      writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChild(writer, child, slug, isConditional, state);
      });
      writer.conditionalWriteLine(isPressable, `</Pressable>`);
    });
    writer.conditionalWriteLine(isConditional, `}`);
  }
}

export function writeChild(
  writer: CodeBlockWriter,
  child: ParseNodeTreeItem,
  slug: string,
  isConditional: boolean,
  state: WriteChildrenState,
) {
  const {data, settings, pressables, getStyleProp, getIconProp} = state;

  // Derived data
  const propRefs = child.node.componentPropertyReferences;
  const instance = parser.getComponentInstanceInfo(child.node as InstanceNode);
  const reaction = parser.getComponentCustomReaction(instance.node);
  // TODO: const pressable = getPressReaction(instance.node);
  const swapNodeProp = parser.getComponentPropName(propRefs?.mainComponent);
  const hasCustomProps = reaction?.type === 'URL';
  const isRootPressable = pressables?.find(e => e[1] === 'root' || !e[1]) !== undefined;
  const isInstance = child.node.type === 'INSTANCE';
  const isAsset = child.node.type === 'VECTOR' || (child.node.isAsset && !isInstance);
  const isText = child.node.type === 'TEXT';
  const isSwap = Boolean(swapNodeProp);
  const isIcon = isInstance
    && child.node.name.includes(':')
    && parser.getPage((child.node as InstanceNode).mainComponent)?.name === PAGES_SPECIAL.ICONS

  // Icon node
  if (isIcon) {
    const icon = getIconProp(slug, isRootPressable);
    state.flags.reactNative.StyleSheet = true;
    // Swap icon, override props for this instance
    if (isSwap) {
      state.flags.react.cloneElement = true;
      const statement = `cloneElement(props.${swapNodeProp}, StyleSheet.flatten(${icon}))`;
      writer.writeLine((isConditional ? '' : '{') + statement + (isConditional ? '' : '}'));
    // Explicit icon, use Icon component directly
    } else {
      state.flags.exoIcon.Icon = true;
      writer.writeLine(`<Icon {...StyleSheet.flatten(${icon})}/>`);
    }
    return;
  }

  // Asset node
  if (isAsset) {
    const asset = data.assetData[child.node.id];
    if (asset) {
      // Vector node
      if (asset.isVector) {
        const vectorTag = '<' + asset.name + '/>'
        writer.writeLine(vectorTag);
      // Asset node
      } else {
        const [assetType, assetSource, ...assetProps] = asset.rawName.split('|');
        const sizeProps = `width={${round(asset.width)}} height={${round(asset.height)}}`;
        const animProps = assetProps?.length
          ? ' ' + assetProps.map(a => a.trim()).join(' ')
          : ' autoplay loop';
        switch (assetType.trim().toLowerCase()) {
          case 'lottie':
            writer.writeLine(`<Lottie url="${assetSource.trim()}"${animProps} ${sizeProps}/>`);
            state.flags.exoLottie.Lottie = true;
            break;
          case 'rive':
            writer.writeLine(`<Rive url="${assetSource.trim()}"${animProps} ${sizeProps}/>`);
            state.flags.exoRive.Rive = true;
            break;
          default:
            if (asset.isVideo) {
              writer.writeLine(`<Video url="${assetSource.trim()}" poster={${asset.name}} ${sizeProps}/>`);
              state.flags.exoVideo.Video = true;
            } else {
              writer.writeLine(`<Image url={${asset.name}} ${sizeProps}/>`);
              state.flags.exoImage.Image = true;
            }
            break;
        }
      }
    } else {
      writer.writeLine(`<View/>`);
    }
    return;
  }

  // Swap node
  if (isSwap) {
    const statement = `props.${swapNodeProp}`;
    writer.writeLine(isConditional ? statement : `{${statement}}`);
    return;
  }

  // Normal node
  let jsxTag: string;
  let jsxTagWithProps: string;
  let jsxStyleProp: string;
  let jsxExtraProps: Array<[string, string]> = [];

  // Custom props (via prototype interaction)
  if (hasCustomProps) {
    jsxExtraProps = reaction.url
      ?.split(',')
      ?.map(p => p.trim())
      ?.map(p => {
        // Prop -> root prop match alias
        const relation = p?.split('->');
        if (relation.length === 2) {
          const [k, v] = relation;
          if (k && v) {
            return [
              `${parser.getComponentPropName(k)}`,
              `{props.${parser.getComponentPropName(v)}}`,
            ] as [string, string];
          }
        }
        // Purely custom input (raw k=v)
        const custom = p?.split('=');
        if (custom.length === 1 && custom[0])
          return [custom[0], ''] as [string, string];
        if (custom.length === 2 && custom[1])
          return [custom[0], custom[1]] as [string, string];
        // Invalid input
        return null as [string, string];
      })
      .filter(Boolean);
  }

  // Styles prop
  if (!isInstance && slug) {
    jsxStyleProp = `${getStyleProp(slug, isRootPressable)}`;
  }

  // Component props
  const jsxProps = writePropsAttributes(
    new CodeBlockWriter(state.settings.writer),
    instance.node.componentProperties,
    state.data.meta.includes,
    instance.node.id,
    jsxStyleProp,
    jsxExtraProps,
  );

  // Create instance tag
  if (isInstance) {
    jsxTag = createIdentifierPascal(instance.main.name);
    jsxTagWithProps = jsxTag + jsxProps;
    if (jsxTagWithProps.includes('<Icon'))
      state.flags.exoIcon.Icon = true;
  // Create primitive tag
  } else {
    jsxTag = getTagName(child.node.type);
    jsxTagWithProps = jsxTag + jsxProps;
    state.flags.reactNative[jsxTag] = true;
  }

  // No children, self closing tag
  if (!isText && !child.children) {
    writer.writeLine(`<${jsxTagWithProps}/>`);
    return;
  }

  // Text properties
  const textPropId = propRefs?.characters;
  const textPropName = textPropId ? parser.getComponentPropName(textPropId) : null;
  const textPropValue = textPropName
    ? `props.${textPropName}`
    : (child.node as TextNode).characters || '';

  // Text input detected
  if (child.node.type === 'TEXT'
    && child.node.name.toLowerCase().startsWith('textinput')
    && child.node.name.includes('|')) {
    const [_, type, value, ...extra] = child.node.name.split('|');
    state.flags.reactNative.TextInput = true;
    writer.write('<TextInput').indent(() => {
      writer.writeLine(`style={${getStyleProp(slug, isRootPressable)}}`);
      writer.writeLine(`testID="${child.node.id}"`);
      // Type (none, text, decimal, numeric, tel, search, email, url)
      writer.writeLine(`inputMode="${type.trim().toLowerCase()}"`);
      // Default value
      // TODO: support state
      writer.writeLine(`defaultValue={${value.trim()}}`);
      // Placeholder (props value)
      if (textPropValue.startsWith('props.')) {
        writer.writeLine(`placeholder={${textPropValue}}`);
      // Placeholder (explict), translate
      } else if (settings?.addTranslate) {
        state.flags.lingui.t = true;
        translate(state.language, textPropValue);
        writer.writeLine(`placeholder={t\`${textPropValue}\`}`);
      } else {
        writer.writeLine(`placeholder={\`${textPropValue}}\``);
      }
      state.flags.useStylesTheme = true;
      writer.writeLine(`placeholderTextColor={${parser.getFillToken(child.node as TextNode)}}`);
      extra?.forEach(p => p && writer.writeLine(p.trim()));
    });
    writer.write(`/>`);
    return;
  }

  // Child nodes, open tag and write children
  writer.write(`<${jsxTagWithProps}>`).indent(() => {
    switch (jsxTag) {
      case 'View':
        writeChildren(writer, child.children, {
          data,
          settings,
          pressables,
          flags: state.flags,
          language: state.language,
          getStyleProp,
          getIconProp,
        });
        break;
      case 'Text':
        // Component property string
        if (textPropValue.startsWith('props.')) {
          writer.write(`{${textPropValue}}`);
        // Explicit string
        } else {
          if (settings?.addTranslate) {
            state.flags.lingui.Trans = true;
            translate(state.language, textPropValue);
            writer.write('<Trans>{`' + textPropValue + '`}</Trans>');
          } else {
            writer.write(`{\`${textPropValue}\`}`);
          }
        }
        break;
    }
  });

  // Closing tag
  writer.writeLine(`</${jsxTag}>`);
}

function getTagName(type: string): 'View' | 'Text' | 'Image' {
  switch (type) {
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    case 'COMPONENT':
    case 'INSTANCE':
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'FRAME':
    default:
      return 'View';
  }
}
