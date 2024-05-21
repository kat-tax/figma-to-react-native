import CodeBlockWriter from 'code-block-writer';
import {round} from 'common/number';
import {createIdentifierPascal} from 'common/string';
import {translate} from 'backend/utils/translate';
import {PAGES_SPECIAL} from './consts';
import {
  getPage,
  getTagName,
  getPropsJSX,
  getPropName,
  getFillToken,
  getInstanceInfo,
  getCustomReaction,
  // getPressReaction,
} from 'backend/parser/lib';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/parse';
import type {ProjectSettings} from 'types/settings';
import type {ImportFlags} from './writeImports';

type StylePrefixMapper = (slug: string, isDynamic: boolean) => string;

export function writeChildren(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
  settings: ProjectSettings,
  language: VariableCollection,
  children: ParseNodeTree,
  getStyleProp: StylePrefixMapper,
  getIconProp: StylePrefixMapper,
  pressables?: string[][],
) {
  const state = {writer, flags, data, language, settings, pressables, getStyleProp, getIconProp};

  for (const child of children) {
    const slug = data.children?.find(c => c.node === child.node)?.slug;
    const pressId = pressables?.find(e => e?.[1] === slug)?.[2];
    const isVariant = !!(child.node as SceneNode & VariantMixin).variantProperties;
    const masterNode = isVariant ? child.node.parent : child.node;
    const propRefs = (masterNode as SceneNode)?.componentPropertyReferences;
    const isPressable = Boolean(pressId);
    const isConditional = Boolean(propRefs?.visible);
    if (isPressable)
      flags.reactNative.Pressable = true;
    writer.conditionalWriteLine(isConditional, `{props.${getPropName(propRefs?.visible)} && `);
    writer.withIndentationLevel((isConditional ? 1 : 0) + writer.getIndentationLevel(), () => {
      writer.conditionalWriteLine(isPressable, `<Pressable onPress={props.${pressId}}>`);
      writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChild(child, slug, isConditional, state);
      });
      writer.conditionalWriteLine(isPressable, `</Pressable>`);
    });
    writer.conditionalWriteLine(isConditional, `}`);
  }
}

function writeChild(
  child: ParseNodeTreeItem,
  slug: string,
  isConditional: boolean,
  state: {
    writer: CodeBlockWriter,
    flags: ImportFlags,
    data: ParseData,
    settings: ProjectSettings,
    language: VariableCollection,
    pressables?: string[][],
    getStyleProp: StylePrefixMapper,
    getIconProp: StylePrefixMapper,
  },
) {
  const {writer, data, settings, pressables, getStyleProp, getIconProp} = state;

  // Derived data
  const testID = ` testID="${child.node.id}"`;
  const propRefs = child.node.componentPropertyReferences;
  const instance = getInstanceInfo(child.node as InstanceNode);
  const reaction = getCustomReaction(instance.node);
  // TODO: const pressable = getPressReaction(instance.node);
  const swapNodeProp = getPropName(propRefs?.mainComponent);
  const jsxBaseProps = getPropsJSX(instance.node.componentProperties, data.meta.includes);
  const hasCustomProps = reaction?.type === 'URL';
  const isRootPressable = pressables?.find(e => e[1] === 'root' || !e[1]) !== undefined;
  const isInstance = child.node.type === 'INSTANCE';
  const isAsset = child.node.type === 'VECTOR' || (child.node.isAsset && !isInstance);
  const isText = child.node.type === 'TEXT';
  const isSwap = Boolean(swapNodeProp);
  const isIcon = isInstance
    && child.node.name.includes(':')
    && getPage((child.node as InstanceNode).mainComponent)?.name === PAGES_SPECIAL.ICONS

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
  let jsxCustomProps = '';

  // Custom props (via prototype interaction)
  if (hasCustomProps) {
    jsxCustomProps = reaction.url
      ?.split(',')
      ?.map(p => p.trim())
      ?.map(p => {
        // Prop -> root prop match alias
        const relation = p?.split('->');
        if (relation.length === 2) {
          const [k, v] = relation;
          if (k && v) {
            return ` ${getPropName(k)}={props.${getPropName(v)}}`;
          }
        }
        // Purely custom input (raw k=v)
        const custom = p?.split('=');
        if (custom.length === 1 && custom[0])
          return ' ' + custom[0];
        if (custom.length === 2 && custom[1])
          return ' ' + custom.join('=');
        // Invalid input
        return '';
      })?.join('');
  }

  // Create instance tag
  if (isInstance) {
    jsxTag = createIdentifierPascal(instance.main.name);
    jsxTagWithProps = jsxTag + jsxCustomProps + jsxBaseProps + testID;
    if (jsxTagWithProps.includes('<Icon'))
      state.flags.exoIcon.Icon = true;
  // Create primitive tag
  } else {
    const styles = slug ? ` style={${getStyleProp(slug, isRootPressable)}}` : '';
    jsxTag = getTagName(child.node.type);
    jsxTagWithProps = jsxTag + styles + jsxCustomProps + jsxBaseProps + testID;
    state.flags.reactNative[jsxTag] = true;
  }

  // No children, self closing tag
  if (!isText && !child.children) {
    writer.writeLine(`<${jsxTagWithProps}/>`);
    return;
  }

  // Text properties
  const textPropId = propRefs?.characters;
  const textPropName = textPropId ? getPropName(textPropId) : null;
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
      writer.writeLine(`placeholderTextColor={${getFillToken(child.node as TextNode)}}`);
      extra?.forEach(p => p && writer.writeLine(p.trim()));
    });
    writer.write(`/>`);
    return;
  }

  // Child nodes, open tag and write children
  writer.write(`<${jsxTagWithProps}>`).indent(() => {
    switch (jsxTag) {
      case 'View':
        writeChildren(
          writer,
          state.flags,
          data,
          settings,
          state.language,
          child.children,
          getStyleProp,
          getIconProp,
          pressables,
        );
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
