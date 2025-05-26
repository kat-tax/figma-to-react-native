import CodeBlockWriter from 'code-block-writer';
import * as parser from 'backend/parser/lib';

import {writePropsImports} from './writePropsImports';

import type {ParseData} from 'types/parse';
import type {ComponentInfo} from 'types/component';

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
    Platform?: boolean,
  },
  reactNativeTypes: {
    StyleProp?: boolean,
    ViewStyle?: boolean,
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
  exoMotion: {
    Motion?: boolean,
  },
  exoLottie: {
    Lottie?: boolean,
  },
  exoRive: {
    Rive?: boolean,
  },
  exoUtils: {
    useVariants?: boolean,
    createIcon?: boolean,
    isNative?: boolean,
    isTouch?: boolean,
  },
  exoGrid: {
    Grid?: boolean,
  },
  // Hook destructuring
  useStylesTheme: boolean,
}

export async function writeImports(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
  infoDb: Record<string, ComponentInfo> | null,
) {
  // Import template
  const writeImport = (name: string, props: Record<string, boolean>, isType?: boolean) => {
    const names = Object.entries(props)
      .map(([k, f]) => f && k)
      .filter(Boolean)
      .sort((a, b) => b?.localeCompare(a));
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
  writeImport('react-exo/utils', flags.exoUtils);
  writeImport('react-native', flags.reactNative);
  writeImport('react-exo/grid', flags.exoGrid);
  writeImport('react-exo/icon', flags.exoIcon);
  writeImport('react-exo/image', flags.exoImage);
  writeImport('react-exo/video', flags.exoVideo);
  writeImport('react-exo/rive', flags.exoRive);
  writeImport('react-exo/lottie', flags.exoLottie);
  writeImport('react-exo/motion', flags.exoMotion);
  writeImport('@lingui/macro', flags.lingui);

  // Component Imports
  const subwriter = new CodeBlockWriter(writer.getOptions());
  const components = Object.entries(data.meta.components);
  if (components.length > 0) {
    components
      .sort((a, b) => a[1][0].name?.localeCompare(b[1][0].name))
      .forEach(([_id, [node, _instance]]) => {
        const component = parser.getComponentInfo(node, infoDb);
        subwriter.write(`import {${component.name}} from`);
        subwriter.space();
        subwriter.quote(component.path);
        subwriter.write(';');
        subwriter.newLine();
        writePropsImports(subwriter, component.propDefs, infoDb, flags.exoIcon.Icon);
      });
    // Split import code by lines, remove duplicates
    const subval = subwriter.toString();
    if (subval.length > 0) {
      const imports = new Set(subval.split('\n'));
      writer.write(Array
        .from(imports)
        .filter(Boolean)
        .sort(sortImports)
        .join('\n'));
      writer.newLine();
    }
  }

  // Image & Vector Imports
  const assets = Object.entries(data.assetData);
  if (assets.length > 0) {
    assets
      .sort((a, b) => a[1].name?.localeCompare(b[1].name))
      .forEach(([_id, asset]) => {
        const [assetType] = asset.rawName.split('|');
        switch (assetType.trim().toLowerCase()) {
          case 'lottie':
          case 'rive':
            return;
          default:
            writer.write(`import ${asset.name} from`);
            writer.space();
            const base = `assets/${asset.isVector ? 'svg' : 'img'}`;
            const path = `${base}/${asset.name.toLowerCase()}.${asset.isVector ? 'svg' : 'png'}`;
            writer.quote(path);
            writer.write(';');
            writer.newLine();
            break;
        }
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

export function sortImports(a: string, b: string) {
  // Get import path (regex everything between ' or ")
  const aPath = a.match(/'([^']+)'/)?.[1] ?? a.match(/"([^"]+)"/)?.[1];
  const bPath = b.match(/'([^']+)'/)?.[1] ?? b.match(/"([^"]+)"/)?.[1];
  return aPath?.localeCompare(bPath);
}

