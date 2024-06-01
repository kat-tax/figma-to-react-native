import CodeBlockWriter from 'code-block-writer';
import {getComponentInfo} from 'backend/parser/lib';
import {writePropsImports} from './writePropsImports';

import type {ParseData} from 'types/parse';

export interface ImportFlags {
  react: {
    useMemo?: boolean,
    useState?: boolean,
    cloneElement?: boolean,
  },
  reactNative: {
    View?: boolean,
    Text?: boolean,
    Pressable?: boolean,
    TextInput?: boolean,
    StyleSheet?: boolean,
  },
  reactNativeTypes: {
    PressableProps?: boolean,
    GestureResponderEvent?: boolean,
    PressableStateCallbackType?: boolean,
  },
  unistyles: {
    useStyles?: boolean,
    createStyleSheet?: boolean,
  },
  lingui: {
    t?: boolean,
    Trans?: boolean,
  },
  exoIcon: {
    Icon?: boolean,
  },
  exoImage: {
    Image?: boolean,
  },
  exoVideo: {
    Video?: boolean,
  },
  exoLottie: {
    Lottie?: boolean,
  },
  exoRive: {
    Rive?: boolean,
  },
  exoVariants: {
    useVariants?: boolean,
  },
  // Hook destructuring
  useStylesTheme: boolean,
}

export async function writeImports(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
) {
  // Import template
  const writeImport = (name: string, props: Record<string, boolean>, isType?: boolean) => {
    const names = Object.entries(props).map(([k, f]) => f && k).filter(Boolean);
    if (!names.length) return;
    writer.write(`import ${isType ? 'type ' : ''}{${names.join(', ')}} from`);
    writer.space();
    writer.quote(name);
    writer.write(';');
    writer.newLine();
  }

  // Package Imports
  writeImport('react', flags.react);
  writeImport('react-native-unistyles', flags.unistyles);
  writeImport('react-exo/variants', flags.exoVariants);
  writeImport('react-native', flags.reactNative);
  writeImport('react-exo/icon', flags.exoIcon);
  writeImport('react-exo/image', flags.exoImage);
  writeImport('react-exo/video', flags.exoVideo);
  writeImport('react-exo/rive', flags.exoRive);
  writeImport('react-exo/lottie', flags.exoLottie);
  writeImport('@lingui/macro', flags.lingui);

  // Component Imports
  const components = Object.entries(data.meta.components);
  if (components.length > 0) {
    components
      .sort((a, b) => a[1][0].name.localeCompare(b[1][0].name))
      .forEach(([_id, [node, _instance]]) => {
        const component = getComponentInfo(node);
        writer.write(`import {${component.name}} from`);
        writer.space();
        writer.quote(component.path);
        writer.write(';');
        writer.newLine();
        writePropsImports(writer, component.propDefs, flags.exoIcon.Icon);
      });
  }

  // Image & Vector Imports
  const assets = Object.entries(data.assetData);
  if (assets.length > 0) {
    assets
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .forEach(([_id, asset]) => {
        writer.write(`import ${asset.name} from`);
        writer.space();
        const base = `assets/${asset.isVector ? 'svg' : 'img'}`;
        const path = `${base}/${asset.name.toLowerCase()}.${asset.isVector ? 'svg' : 'png'}`;
        writer.quote(path);
        writer.write(';');
        writer.newLine();
      });
    writer.blankLineIfLastNot();
  }

  // Type Imports
  if (flags.reactNativeTypes) {
    writer.blankLineIfLastNot();
    writeImport('react-native', flags.reactNativeTypes, true);
  }

  writer.blankLineIfLastNot();
}
