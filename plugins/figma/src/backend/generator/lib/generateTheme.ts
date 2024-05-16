import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor, getVariables, getVariableCollection, getVariableCollectionModes} from 'backend/parser/lib';
import {isReadOnly} from 'backend/utils/mode';
import {VARIABLE_COLLECTIONS} from './consts';

import type {ProjectSettings} from 'types/settings';

export async function generateTheme(settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);
  writer.writeLine('export type Themes = keyof typeof themes;');
  writer.blankLine();
  await writeBreakpoints(writer);
  await writeDisplay(writer);
  const fonts = await writeFonts(writer);
  await writePalette(writer);
  const themes = await writeThemes(writer);
  return {fonts, themes};
}

// Sections

async function writeBreakpoints(writer: CodeBlockWriter) {
  const display = await getFloatScaleVariables(VARIABLE_COLLECTIONS.BREAKPOINTS, 'breakpoints');

  writer.write('export const breakpoints = {').indent(() => {
    // Write breakpoints (if any)
    const keys = Object.keys(display);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = display[group] as ScaleFloatToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No breakpoints found, write default breakpoints
    } else {
      writer.writeLine('xs: 0,');
      writer.writeLine('sm: 576,');
      writer.writeLine('md: 768,');
      writer.writeLine('lg: 992,');
      writer.writeLine('xl: 1200,');
    }
  }).writeLine(`} as const;`);

  writer.blankLine();
}

async function writeDisplay(writer: CodeBlockWriter) {
  const display = await getFloatScaleVariables(VARIABLE_COLLECTIONS.SCALE_DISPLAY, 'display');

  writer.write('export const display = {').indent(() => {
    // Write display scales (if any)
    const keys = Object.keys(display);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = display[group] as ScaleFloatToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No display scales found, write empty object
    } else {
      writer.write(`// No "${VARIABLE_COLLECTIONS.SCALE_DISPLAY}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();
}

async function writeFonts(writer: CodeBlockWriter) {
  const font = await getFontScaleVariables(VARIABLE_COLLECTIONS.FONTS, 'font');
  const typography = await getFloatScaleVariables(VARIABLE_COLLECTIONS.SCALE_FONTS, 'typography');

  writer.write('export const typography = {').indent(() => {
    // Write font scales (if any)
    const keys = Object.keys(typography);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = typography[group] as ScaleFloatToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No font scales found, write empty object
    } else {
      writer.write(`// No "${VARIABLE_COLLECTIONS.SCALE_FONTS}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  writer.write('export const font = {').indent(() => {
    // Write fonts (if any)
    const keys = Object.keys(font.refs);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = font.refs[group] as ScaleRefToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No fonts found, write empty object
    } else {
      writer.write(`// No "${VARIABLE_COLLECTIONS.FONTS}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  return font.names;
}

async function writePalette(writer: CodeBlockWriter) {
  const colors = await getColorScaleVariables(VARIABLE_COLLECTIONS.SCALE_COLORS, 'palette');

  writer.write('export const palette = {').indent(() => {
    // Write color scales (if any)
    const keys = Object.keys(colors);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group] as ScaleColorToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No colors found, write empty object
    } else {
      writer.write(`// No "${VARIABLE_COLLECTIONS.SCALE_COLORS}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();
}

async function writeThemes(writer: CodeBlockWriter) {
  const collection = await getVariableCollectionModes(VARIABLE_COLLECTIONS.THEMES);
  const themes: {[key: string]: ScaleColors} = {};
  let hasStyles = false;

  // Theme variable collection found, use variables + local styles
  if (collection) {
    for await (const mode of collection.modes)
      themes[mode.name] = await getColorTokens(mode.modeId);
  // No theme variable collection found, use local styles only
  } else {
    themes['main'] = await getColorLocalStyles();
  }

  writer.write('export const themes = {').indent(() => {
    for (const [name, colors] of Object.entries(themes)) {
      writer.write(`${createIdentifierCamel(name)}: `).inlineBlock(() => {
        hasStyles = writeThemeColors(writer, colors);
        writer.writeLine('breakpoints,');
        writer.writeLine('display,');
        writer.writeLine('font,');
        writer.writeLine('palette,');
        writer.writeLine('typography,');
      });
      writer.write(',');
      writer.newLine();
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  // Default theme export
  const prefix = 'export const initialTheme: Themes = ';
  const suffix = ' as const';
  if (collection) {
    const initialTheme = createIdentifierCamel(collection.default.name);
    writer.writeLine(`${prefix}'${initialTheme}'`);
  } else {
    writer.writeLine(`${prefix}'main'${suffix}`);
  }

  // Return token code, theme collection, and whether styles exist
  const code = writer.toString();
  return {code, collection, hasStyles};
}

// Types

type ScaleToken = ScaleColorToken | ScaleFloatToken | ScaleRefToken;

type ScaleColors = Record<string, ScaleColorGroup>;
type ScaleColorGroup = Record<string, ScaleColorToken> | ScaleColorToken;
type ScaleColorToken = {value: string, comment: string};

type ScaleFloats = Record<string, ScaleFloatGroup>;
type ScaleFloatGroup = Record<string, ScaleFloatToken> | ScaleFloatToken;
type ScaleFloatToken = {value: number, comment: string};

type ScaleRefs = Record<string, ScaleRefGroup>;
type ScaleRefGroup = Record<string, ScaleRefToken> | ScaleRefToken;
type ScaleRefToken = {value: string, comment: string};

// Helpers

function writeThemeColors(writer: CodeBlockWriter, colors: ScaleColors) {
  // Write theme colors (if any)
  const keys = Object.keys(colors);
  if (keys.length > 0) {
    writer.write('colors: ').inlineBlock(() => {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group] as ScaleColorToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    });
    writer.write(',');
    writer.newLine();
    return true;
  // No colors found, write empty object
  } else {
    writer.write('// No local color styles or color variables found');
    return false;
  }
}

function writeScaleToken(writer: CodeBlockWriter, name: string, token: ScaleToken) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (token.comment)
    writer.writeLine(`/** ${token.comment} */`);
  if (typeof token.value === 'number'
    || token.value.includes('.')
    || token.value.startsWith('palette.')) {
    writer.write(`${id}: ${token.value},`);
  } else {
    writer.write(`${id}: `);
    writer.quote(token.value);
    writer.write(',');
  }
}

// Getters / Setters

async function getColorTokens(themeId: string): Promise<ScaleColors> {
  return {
    ...await getColorScaleVariables(VARIABLE_COLLECTIONS.THEMES, 'colors', themeId),
    ...await getColorLocalStyles(),
  };
}

async function getColorLocalStyles(): Promise<ScaleColors> {
  const colors: ScaleColors = {};
  const styles = await figma.getLocalPaintStylesAsync();
  styles?.forEach(paint => {
    colors[paint.name] = {
      // @ts-ignore (TODO: expect only solid paints to fix this)
      value: getColor(paint.paints[0]?.color || {r: 0, g: 0, b: 0}),
      comment: paint.description,
    }
  });
  return colors;
}

async function getColorScaleVariables(key: string, ns: string, themeId?: string): Promise<ScaleColors> {
  const colors: ScaleColors = {};
  const collection = await getVariableCollection(key);
  if (!collection) return colors;
  const vars = await getVariables(collection.variableIds);
  for await (const v of vars) {
    setVariableCodeSyntax(v, ns);
    if (themeId) {
      const value = v.valuesByMode[themeId] as VariableAlias;
      if (!value || !value.id) continue;
      const color = await figma.variables.getVariableByIdAsync(value.id);
      if (!color) continue;
      colors[v.name] = {
        value: `palette.${createIdentifierCamel(color.name)}`,
        comment: v.description,
      }
    } else {
      colors[v.name] = {
        value: getColor(v.valuesByMode[collection.defaultModeId] as RGBA),
        comment: v.description,
      }
    }
  }
  return colors;
}

async function getFloatScaleVariables(key: string, ns: string): Promise<ScaleFloats> {
  const scales: ScaleFloats = {};
  const collection = await getVariableCollection(key);
  if (!collection) return scales;
  const vars = await getVariables(collection.variableIds);
  for await (const v of vars) {
    if (v.resolvedType === 'FLOAT') {
      setVariableCodeSyntax(v, ns);
      scales[v.name] = {
        value: parseFloat(parseFloat(v.valuesByMode[collection.defaultModeId].toString()).toFixed(5)),
        comment: v.description,
      }
    }
  }
  return scales;
}

async function getFontScaleVariables(key: string, ns: string): Promise<{names: string[], refs: ScaleRefs}> {
  const names: string[] = [];
  const refs: ScaleRefs = {};
  const collection = await getVariableCollection(key);
  if (!collection) return {names: ['Inter'], refs};
  const vars = await getVariables(collection.variableIds);
  for await (const v of vars) {
    const value = v.valuesByMode[collection.defaultModeId] as any;
    const isRef = value?.type === 'VARIABLE_ALIAS';
    const alias = isRef ? await figma.variables.getVariableByIdAsync(value.id) : null;
    setVariableCodeSyntax(v, ns);
    refs[v.name] = {
      value: isRef ? `typography.${createIdentifierCamel(alias.name)}` : value,
      comment: v.description,
    }
  }
  return {names, refs};
}

function setVariableCodeSyntax(variable: Variable, namespace: string) {
  const id = `theme.${namespace}.${createIdentifierCamel(variable.name)}`;
  if (!isReadOnly() && variable.codeSyntax?.WEB !== id) {
    variable.setVariableCodeSyntax('WEB', id);
  }
}
