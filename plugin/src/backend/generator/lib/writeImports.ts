import CodeBlockWriter from 'code-block-writer';
import {getComponentInfo} from 'backend/parser/lib';
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
    StyleSheet?: boolean,
    withUnistyles?: boolean,
  },
  lingui: {
    useLingui?: boolean,
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
  exoTextInput: {
    TextInput?: boolean,
  },
  exoUtils: {
    useVariants?: boolean,
    isNative?: boolean,
    isTouch?: boolean,
  },
  exoGrid: {
    GridView?: boolean,
    GridViewItem?: boolean,
  },
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
  writeImport('@lingui/react/macro', flags.lingui);
  writeImport('react-exo/utils', flags.exoUtils);
  writeImport('react-native-unistyles', flags.unistyles);
  writeImport('react-native', flags.reactNative);
  //writeImport('react-exo/textinput', flags.exoTextInput);
  //writeImport('react-exo/icon', flags.exoIcon);
  writeImport('textinput.tsx', flags.exoTextInput); // TEMP
  writeImport('icons.tsx', flags.exoIcon); // TEMP
  writeImport('react-exo/grid', flags.exoGrid);
  writeImport('react-exo/image', flags.exoImage);
  writeImport('react-exo/video', flags.exoVideo);
  writeImport('react-exo/rive', flags.exoRive);
  writeImport('react-exo/lottie', flags.exoLottie);
  writeImport('react-exo/motion', flags.exoMotion);

  // Component Imports
  const subwriter = new CodeBlockWriter(writer.getOptions());
  const components = Object.entries(data.meta.components);
  if (components.length > 0) {
    writer.blankLine();
    components
      .sort((a, b) => a[1][0].name?.localeCompare(b[1][0].name))
      .forEach(([_id, [node, _instance]]) => {
        const component = getComponentInfo(node, infoDb);
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
    // Spacer if more than one asset or component
    if (assets.length > 1 || components.length > 1) {
      writer.blankLine();
    }
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
            writer.quote(`./assets/${asset.name.toLowerCase()}.${asset.isVector ? 'svg' : 'png'}`);
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
  // Get import paths and compare
  const getPath = (str: string) => str.match(/['"]([^'"]+)['"]/)?.[1];
  const pathA = getPath(a);
  const pathB = getPath(b);

  if (!pathA || !pathB) {
    return pathA?.localeCompare(pathB || '') || 0;
  }

  // Find the common prefix by splitting on '/' and comparing segments
  const segmentsA = pathA.split('/');
  const segmentsB = pathB.split('/');
  let length = 0;
  const minLength = Math.min(segmentsA.length, segmentsB.length);
  for (let i = 0; i < minLength - 1; i++) { // -1 to exclude the filename
    if (segmentsA[i] === segmentsB[i]) {
      length = i + 1;
    } else {
      break;
    }
  }

  // If they share a meaningful common prefix (at least 2 directory levels)
  if (length >= 2) {
    const prefixA = segmentsA.slice(0, length).join('/');
    const prefixB = segmentsB.slice(0, length).join('/');
    if (prefixA === prefixB) {
      // Same meaningful prefix - sort by total string length (bayesian curve)
      const lengthDiff = a.length - b.length;
      if (lengthDiff !== 0) {
        return lengthDiff;
      }
    }
  }

  // Fall back to alphabetical sorting by path
  return pathA.localeCompare(pathB);
}

