import CodeBlockWriter from 'code-block-writer';
import {isReadOnly} from 'backend/utils/mode';

import * as string from 'common/string';
import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';

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
  const display = await getFloatVariables(consts.VARIABLE_COLLECTIONS.BREAKPOINTS, 'breakpoints');

  writer.write('export const breakpoints = {').indent(() => {
    // Write breakpoints (if any)
    const keys = Object.keys(display);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = string.createIdentifierCamel(group);
        const groupItem = display[group] as FloatToken;
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
  const display = await getFloatVariables(consts.VARIABLE_COLLECTIONS.SCALE_DISPLAY, 'display');

  writer.write('export const display = {').indent(() => {
    // Write display scales (if any)
    const keys = Object.keys(display);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = string.createIdentifierCamel(group);
        const groupItem = display[group] as FloatToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No display scales found, write empty object
    } else {
      writer.write(`// No "${consts.VARIABLE_COLLECTIONS.SCALE_DISPLAY}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();
}

async function writeFonts(writer: CodeBlockWriter) {
  const font = await getFontVariables(consts.VARIABLE_COLLECTIONS.FONTS, 'font');
  const typography = await getFloatVariables(consts.VARIABLE_COLLECTIONS.SCALE_FONTS, 'typography');

  writer.write('export const typography = {').indent(() => {
    // Write font scales (if any)
    const keys = Object.keys(typography);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = string.createIdentifierCamel(group);
        const groupItem = typography[group] as FloatToken;
        // Hack: font weight needs to be a string
        if (groupId.startsWith('weight'))
          groupItem.value = groupItem.value.toString()
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No font scales found, write empty object
    } else {
      writer.write(`// No "${consts.VARIABLE_COLLECTIONS.SCALE_FONTS}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  writer.write('export const font = {').indent(() => {
    // Write fonts (if any)
    const keys = Object.keys(font.refs);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = string.createIdentifierCamel(group);
        const groupItem = font.refs[group] as FontToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No fonts found, write empty object
    } else {
      writer.write(`// No "${consts.VARIABLE_COLLECTIONS.FONTS}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  return font.names;
}

async function writePalette(writer: CodeBlockWriter) {
  const colors = await getColorVariables(consts.VARIABLE_COLLECTIONS.SCALE_COLORS, 'palette');

  writer.write('export const palette = {').indent(() => {
    // Write color scales (if any)
    const keys = Object.keys(colors);
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = string.createIdentifierCamel(group);
        const groupItem = colors[group] as ColorToken;
        writeScaleToken(writer, groupId, groupItem);
        writer.newLine();
      });
    // No colors found, write empty object
    } else {
      writer.write(`// No "${consts.VARIABLE_COLLECTIONS.SCALE_COLORS}" variable collection found`);
    }
  }).writeLine(`} as const;`);

  writer.blankLine();
}

async function writeThemes(writer: CodeBlockWriter) {
  const collection = await parser.getVariableCollectionModes(consts.VARIABLE_COLLECTIONS.THEMES);
  const themes: {[key: string]: Colors} = {};
  let hasStyles = false;

  // Theme variable collection found, use variables + local styles
  if (collection) {
    for await (const mode of collection.modes)
      themes[mode.name] = await getColorTokens(mode.modeId);
  // No theme variable collection found, use local styles only
  } else {
    themes['Main'] = await getColorLocalStyles();
  }

  writer.write('export const themes = {').indent(() => {
    for (const [name, colors] of Object.entries(themes)) {
      writer.write(`${string.createIdentifierCamel(name)}: `).inlineBlock(() => {
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
    const initialTheme = string.createIdentifierCamel(collection.default.name);
    writer.writeLine(`${prefix}'${initialTheme}'`);
  } else {
    writer.writeLine(`${prefix}'main'${suffix}`);
  }

  // Return token code, theme collection, and whether styles exist
  const code = writer.toString();
  return {code, collection, hasStyles};
}

// Types

type Token = ColorToken | FloatToken | FontToken;

type Colors = Record<string, ColorGroup>;
type ColorGroup = Record<string, ColorToken> | ColorToken;
type ColorToken = {value: string, comment: string};

type Floats = Record<string, FloatGroup>;
type FloatGroup = Record<string, FloatToken> | FloatToken;
type FloatToken = {value: number | string, comment: string};

type Fonts = Record<string, FontGroup>;
type FontGroup = Record<string, FontToken> | FontToken;
type FontToken = {value: string, comment: string};

// Helpers

function writeThemeColors(writer: CodeBlockWriter, colors: Colors) {
  // Write theme colors (if any)
  const keys = Object.keys(colors);
  if (keys.length > 0) {
    writer.write('colors: ').inlineBlock(() => {
      keys.forEach(group => {
        const groupId = string.createIdentifierCamel(group);
        const groupItem = colors[group] as ColorToken;
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

function writeScaleToken(writer: CodeBlockWriter, name: string, token: Token) {
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

async function getColorTokens(themeId: string): Promise<Colors> {
  return {
    ...await getColorVariables(consts.VARIABLE_COLLECTIONS.THEMES, 'colors', themeId),
    ...await getColorLocalStyles(),
  };
}

async function getColorLocalStyles(): Promise<Colors> {
  const colors: Colors = {};
  const styles = await figma.getLocalPaintStylesAsync();
  styles?.forEach(paint => {
    colors[paint.name] = {
      // @ts-ignore (TODO: expect only solid paints to fix this)
      value: parser.getColor(paint.paints[0]?.color || {r: 0, g: 0, b: 0}),
      comment: paint.description,
    }
  });
  return colors;
}

async function getColorVariables(key: string, ns: string, themeId?: string): Promise<Colors> {
  const colors: Colors = {};
  const collection = await parser.getVariableCollection(key);
  if (!collection) return colors;
  const vars = await parser.getVariables(collection.variableIds);
  for await (const v of vars) {
    setVariableCodeSyntax(v, ns);
    if (themeId) {
      const value = v.valuesByMode[themeId] as VariableAlias;
      if (!value || !value.id) continue;
      const color = await figma.variables.getVariableByIdAsync(value.id);
      if (!color) continue;
      colors[v.name] = {
        value: `palette.${string.createIdentifierCamel(color.name)}`,
        comment: v.description,
      }
    } else {
      colors[v.name] = {
        value: parser.getColor(v.valuesByMode[collection.defaultModeId] as RGBA),
        comment: v.description,
      }
    }
  }
  return colors;
}

async function getFloatVariables(key: string, ns: string): Promise<Floats> {
  const scales: Floats = {};
  const collection = await parser.getVariableCollection(key);
  if (!collection) return scales;
  const vars = await parser.getVariables(collection.variableIds);
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

async function getFontVariables(key: string, ns: string): Promise<{names: string[], refs: Fonts}> {
  const names: string[] = [];
  const refs: Fonts = {};
  const collection = await parser.getVariableCollection(key);

  // No variable collection found, use Inter as default font
  if (!collection)
    return {names: ['Inter'], refs};

  // Use variables from collection
  const vars = await parser.getVariables(collection.variableIds);
  for await (const v of vars) {
    const value = v.valuesByMode[collection.defaultModeId] as any;
    const isRef = value?.type === 'VARIABLE_ALIAS';
    const alias = isRef ? await figma.variables.getVariableByIdAsync(value.id) : null;
    setVariableCodeSyntax(v, ns);
    refs[v.name] = {
      value: isRef
        ? alias.resolvedType === 'FLOAT'
          ? `typography.${string.createIdentifierCamel(alias.name)}`
          : Object.values(alias.valuesByMode).shift()
        : value,
      comment: v.description,
    }
  }
  return {names, refs};
}

function setVariableCodeSyntax(variable: Variable, namespace: string) {
  const name = string.createIdentifierCamel(variable.name);
  const id = `var(--theme-${namespace}-${name})`;
  if (!isReadOnly && variable.codeSyntax?.WEB !== id) {
    variable.setVariableCodeSyntax('WEB', id);
  }
}
