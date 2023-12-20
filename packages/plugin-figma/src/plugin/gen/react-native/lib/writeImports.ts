import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';

import type {ParseData} from 'types/parse';

export interface ImportFlags {
  exo: {
    Icon?: boolean,
  },
  lingui: {
    Trans?: boolean,
  },
  unistyles: {
    useStyles?: boolean,
    createStyleSheet?: boolean,
  },
  react: {
    useMemo?: boolean,
    useState?: boolean,
    cloneElement?: boolean,
  },
  reactNative: {
    View?: boolean,
    Text?: boolean,
    Image?: boolean,
    Pressable?: boolean,
  },
  reactNativeTypes: {
    GestureResponderEvent?: boolean,
    PressableStateCallbackType?: boolean,
  },
}

export function writeImports(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
) {
  function writeImport(name: string, props: Record<string, boolean>, isType?: boolean) {
    const names = Object.entries(props).map(([k, f]) => f && k).filter(Boolean);
    if (!names.length) return;
    writer.write(`import ${isType ? 'type ' : ''}{${names.join(', ')}} from`);
    writer.space();
    writer.quote(name);
    writer.write(';');
    writer.newLine();
  }

  // Header
  writeImport('react', flags.react);
  writeImport('react-native-unistyles', flags.unistyles);
  writeImport('react-native', flags.reactNative);
  writeImport('react-native-exo', flags.exo);
  writeImport('@lingui/macro', flags.lingui);

  // TODO: aria hooks for each primitive
  // writer.writeLine(`import {useButton} from '@react-native-aria/button';`);
  // writer.writeLine(`import {useHover} from '@react-native-aria/interactions';`);
  // writer.writeLine(`import {useFocusRing} from '@react-native-aria/focus';`);
  // writer.newLine();

  // Subcomponents
  const components = Object.entries(data.meta.components);
  if (components.length > 0) {
    components
      .sort((a, b) => a[1][0].name.localeCompare(b[1][0].name))
      .forEach(([_id, [node, _instance]]) => {
        const component = createIdentifierPascal(node.name);
        writer.write(`import {${component}} from`);
        writer.space();
        writer.quote(`components/${component}`);
        writer.write(';');
        writer.newLine();
      });
  }

  const assets = Object.entries(data.assetData);
  if (assets.length > 0) {
    assets
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .forEach(([_id, asset]) => {
        writer.write(`import ${asset.name} from`);
        writer.space();
        const base = `assets/${asset.isVector ? 'vectors' : 'images'}`;
        const path = `${base}/${asset.name}.${asset.isVector ? 'svg' : 'png'}`;
        writer.quote(path);
        writer.write(';');
        writer.newLine();
      });
    writer.blankLineIfLastNot();
  }

  // Types
  if (flags.reactNativeTypes) {
    writer.blankLineIfLastNot();
    writeImport('react-native', flags.reactNativeTypes, true);
  }

  writer.blankLineIfLastNot();
}
