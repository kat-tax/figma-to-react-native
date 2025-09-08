const DEBUG = false;

const REACT_NATIVE_COMPONENT_NAMES = [
  'ActivityIndicator',
  'View',
  'Text',
  'Image',
  'ImageBackground',
  'KeyboardAvoidingView',
  'Pressable',
  'ScrollView',
  'FlatList',
  'SectionList',
  'Switch',
  'TextInput',
  'RefreshControl',
  'TouchableHighlight',
  'TouchableOpacity',
  'VirtualizedList',
  'Animated',
  'SafeAreaView',
];

const UnistyleDependency = {
  Theme: 0,
  ThemeName: 1,
  AdaptiveThemes: 2,
  Breakpoints: 3,
  Variants: 4,
  ColorScheme: 5,
  Dimensions: 6,
  Orientation: 7,
  ContentSizeCategory: 8,
  Insets: 9,
  PixelRatio: 10,
  FontScale: 11,
  StatusBar: 12,
  NavigationBar: 13,
  Ime: 14,
  Rtl: 15,
} as const;

export function transformUnistyles(code: string, path: string, counters: Map<string, number>): string {
  if (!shouldProcess(code)) return code;
  if (!counters.has(path)) counters.set(path, 0);

  let result = code;
  result = transformReactNativeImports(result);
  result = transformStyleSheetCreate(result, path, counters);
  result = transformVariants(result);

  if (DEBUG) console.log(`[unistyles]: Transformed ${path}`, result);

  return result;
}

function transformReactNativeImports(code: string): string {
  // Transform React Native component imports to Unistyles imports
  return code.replace(/import\s*\{([^}]+)\}\s*from\s*['"]react-native['"];?/g, (_match, imports) => {
    const importList = imports.split(',').map((imp: string) => imp.trim());
    const importsUnistyles: string[] = [];
    const importsRemaining: string[] = [];
    importList.forEach((imp: string) => {
      // Handle aliased imports like "View as RNView"
      const aliasMatch = imp.match(/(\w+)\s+as\s+(\w+)/);
      const componentName = aliasMatch ? aliasMatch[1] : imp;
      const localName = aliasMatch ? aliasMatch[2] : imp;
      if (REACT_NATIVE_COMPONENT_NAMES.includes(componentName)) {
        importsUnistyles.push(
          aliasMatch
            ? `import { ${componentName} as ${localName} } from 'react-native-unistyles/components/native/${componentName}';`
            : `import { ${componentName} } from 'react-native-unistyles/components/native/${componentName}';`
        );
      } else {
        importsRemaining.push(imp);
      }
    });
    // Join imports and remaining imports
    let result = importsUnistyles.join('\n');
    if (importsRemaining.length > 0) {
      result += `\nimport { ${importsRemaining.join(', ')} } from 'react-native';`;
    }
    return result;
  });
}

function transformStyleSheetCreate(code: string, path: string, counters: Map<string, number>): string {
  let result = code;
  let index = 0;
  while (true) {
    // Find the next occurrence of StyleSheet.create
    const createIndex = result.indexOf('StyleSheet.create', index);
    // If there is no occurrence, break
    if (createIndex === -1) break;
    // Find the opening parenthesis
    const openParenIndex = result.indexOf('(', createIndex);
    // If there is no opening parenthesis, skip to the next occurrence
    if (openParenIndex === -1) break;
    // Find the matching closing parenthesis
    let parenCount = 1;
    let closeParenIndex = openParenIndex + 1;
    // Find the matching closing parenthesis
    while (closeParenIndex < result.length && parenCount > 0) {
      if (result[closeParenIndex] === '(') parenCount++;
      else if (result[closeParenIndex] === ')') parenCount--;
      closeParenIndex++;
    }
    // If there are unmatched parentheses, skip to the next occurrence
    if (parenCount !== 0) {
      index = createIndex + 1;
      continue;
    }
    // Back up to the actual closing paren
    closeParenIndex--;
    // Extract the full StyleSheet.create call
    const fullCall = result.substring(createIndex, closeParenIndex + 1);
    const styleObject = result.substring(openParenIndex + 1, closeParenIndex);
    // Check if it already has an ID (avoid double processing)
    if (fullCall.match(/,\s*\d+\s*\)$/)) {
      index = closeParenIndex + 1;
      continue;
    }
    // Generate unique ID
    const baseId = stringToUniqueId(path);
    const currentTag = counters.get(path) || 0;
    const uniqueId = baseId + currentTag + 1;
    counters.set(path, currentTag + 1);
    // Detect dependencies
    const dependencies = detectDependencies(styleObject);
    // Add dependencies to style objects if detected
    let transformedObject = styleObject;
    if (dependencies.length > 0) {
      const dependenciesArray = `[${dependencies.join(', ')}]`;
      transformedObject = addDependenciesToStyleObject(styleObject, dependenciesArray);
    }
    // Replace the StyleSheet.create call with the transformed version
    const newCall = `StyleSheet.create(${transformedObject}, ${uniqueId})`;
    result = result.substring(0, createIndex) + newCall + result.substring(closeParenIndex + 1);
    // Update search index
    index = createIndex + newCall.length;
  }
  return result;
}

function transformVariants(code: string): string {
  // Transform variant usage to create scoped blocks
  return code.replace(/(\w+)\.useVariants\s*\(\s*([^)]+)\s*\)/g, (_match, styleName, variantConfig) => {
    // Create scoped variant usage
    return `(() => {
      const _${styleName} = ${styleName};
      const ${styleName} = _${styleName}.useVariants(${variantConfig});
      return ${styleName};
    })()`;
  });
}

function addDependenciesToStyleObject(obj: string, deps: string): string {
  // Handle arrow function case: theme => ({...})
  if (obj.includes('=>')) {
    return obj.replace(
      /=>\s*\(\s*(\{[\s\S]*\})\s*\)/,
      (match, objectPart) => {
        const transformedObject = addDependenciesToObject(objectPart, deps);
        return match.replace(objectPart, transformedObject);
      }
    );
  }
  // Handle direct object case: {...}
  return addDependenciesToObject(obj, deps);
}

function addDependenciesToObject(obj: string, deps: string): string {
  // Add dependencies to individual style properties within the object
  return obj.replace(
    /(\w+)\s*:\s*\{([^}]*)\}/g,
    (styleMatch, styleName, styleProps) => {
      if (!styleProps.includes('uni__dependencies')) {
        const trimmedProps = styleProps.trim();
        const separator = trimmedProps === '' ? '' : trimmedProps.endsWith(',') ? ' ' : ', ';
        return `${styleName}: {${styleProps}${separator}uni__dependencies: ${deps}}`;
      }
      return styleMatch;
    }
  );
}

function toUnistylesDependency(name: string): number | null {
  switch (name) {
    case 'theme':
      return UnistyleDependency.Theme;
    case 'themeName':
      return UnistyleDependency.ThemeName;
    case 'adaptiveThemes':
      return UnistyleDependency.AdaptiveThemes;
    case 'breakpoint':
      return UnistyleDependency.Breakpoints;
    case 'colorScheme':
      return UnistyleDependency.ColorScheme;
    case 'screen':
      return UnistyleDependency.Dimensions;
    case 'isPortrait':
    case 'isLandscape':
      return UnistyleDependency.Orientation;
    case 'contentSizeCategory':
      return UnistyleDependency.ContentSizeCategory;
    case 'ime':
      return UnistyleDependency.Ime;
    case 'insets':
      return UnistyleDependency.Insets;
    case 'pixelRatio':
      return UnistyleDependency.PixelRatio;
    case 'fontScale':
      return UnistyleDependency.FontScale;
    case 'statusBar':
      return UnistyleDependency.StatusBar;
    case 'navigationBar':
      return UnistyleDependency.NavigationBar;
    case 'variants':
      return UnistyleDependency.Variants;
    case 'rtl':
      return UnistyleDependency.Rtl;
    default:
      return null;
  }
}

function detectDependencies(code: string): number[] {
  const dependencies = new Set<number>();
  const patterns = [
    {regex: /\btheme\b/, dependency: 'theme'},
    {regex: /\bthemeName\b/, dependency: 'themeName'},
    {regex: /\badaptiveThemes\b/, dependency: 'adaptiveThemes'},
    {regex: /\bbreakpoint\b/, dependency: 'breakpoint'},
    {regex: /\bcolorScheme\b/, dependency: 'colorScheme'},
    {regex: /\bscreen\b/, dependency: 'screen'},
    {regex: /\bisPortrait\b/, dependency: 'isPortrait'},
    {regex: /\bisLandscape\b/, dependency: 'isLandscape' },
    {regex: /\bcontentSizeCategory\b/, dependency: 'contentSizeCategory'},
    {regex: /\brt\.insets\b|\binsets\b/, dependency: 'insets'},
    {regex: /\brt\.insets\.ime\b|\binsets\.ime\b|\bime\b/, dependency: 'ime'},
    {regex: /\bpixelRatio\b/, dependency: 'pixelRatio'},
    {regex: /\bfontScale\b/, dependency: 'fontScale'},
    {regex: /\bstatusBar\b/, dependency: 'statusBar'},
    {regex: /\bnavigationBar\b/, dependency: 'navigationBar'},
    {regex: /\bvariants\s*:/, dependency: 'variants'},
    {regex: /\brtl\b/, dependency: 'rtl'},
  ];
  patterns.forEach(({regex, dependency}) => {
    if (regex.test(code)) {
      const depNumber = toUnistylesDependency(dependency);
      if (depNumber !== null) {
        dependencies.add(depNumber);
      }
    }
  });
  return Array.from(dependencies);
}

function stringToUniqueId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  return absHash % 1000000000;
}

function shouldProcess(code: string): boolean {
  return code.includes('react-native-unistyles')
    || code.includes("from 'react-native'")
    || code.includes("StyleSheet.create");
}
