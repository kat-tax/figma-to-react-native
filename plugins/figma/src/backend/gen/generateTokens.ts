import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor, getVariableCollection, getVariableCollectionModes} from 'backend/fig/lib';
import {VARIABLE_COLLECTIONS} from 'backend/gen/lib/consts';
import {isReadOnly} from 'backend/utils/mode';

import type {ProjectSettings} from 'types/settings';

export function generateTokens(settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);
  writer.writeLine('export type Themes = keyof typeof themes;');
  writer.blankLine();
  writeBreakpoints(writer);
  writeDisplay(writer);
  const fonts = writeFonts(writer);
  writePalette(writer);
  const themes = writeThemes(writer);
  return {fonts, themes};
}

// Sections

function writeBreakpoints(writer: CodeBlockWriter) {
  const display = getFloatScaleVariables(VARIABLE_COLLECTIONS.BREAKPOINTS, 'breakpoints');

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

function writeDisplay(writer: CodeBlockWriter) {
  const display = getFloatScaleVariables(VARIABLE_COLLECTIONS.SCALE_DISPLAY, 'display');

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
      writer.write('// No display variables found');
    }
  }).writeLine(`} as const;`);

  writer.blankLine();
}

function writeFonts(writer: CodeBlockWriter) {
  const font = getFontScaleVariables(VARIABLE_COLLECTIONS.FONTS, 'font');
  const typography = getFloatScaleVariables(VARIABLE_COLLECTIONS.SCALE_FONTS, 'typography');

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
      writer.write('// No font scale variables found');
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
      writer.write('// No font variables found');
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  return font.names;
}

function writePalette(writer: CodeBlockWriter) {
  const colors = getColorScaleVariables(VARIABLE_COLLECTIONS.SCALE_COLORS, 'palette');

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
      writer.write('// No color scale variables found');
    }
  }).writeLine(`} as const;`);

  writer.blankLine();
}

function writeThemes(writer: CodeBlockWriter) {
  const theme = getVariableCollectionModes(VARIABLE_COLLECTIONS.THEMES);
  let hasStyles = false;

  writer.write('export const themes = {').indent(() => {
    // Theme variable collection found, write modes to themes
    if (theme) {
      theme.modes.forEach(mode => {
        writer.write(`${createIdentifierCamel(mode.name)}: `).inlineBlock(() => {
          hasStyles = writeThemeColors(writer, getColorTokens(mode.modeId));
          writer.writeLine('breakpoints,');
          writer.writeLine('display,');
          writer.writeLine('font,');
          writer.writeLine('palette,');
          writer.writeLine('typography,');
        });
        writer.write(',');
        writer.newLine();
      });
    // No theme variable collection found, local styles only
    } else {
      writer.write(`main: `).inlineBlock(() => {
        hasStyles = writeThemeColors(writer, getColorLocalStyles());
      });
      writer.write(',');
      writer.newLine();
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  // Default theme export
  const prefix = 'export const initialTheme: Themes = ';
  const suffix = ' as const';
  if (theme) {
    const initialTheme = createIdentifierCamel(theme.default.name);
    writer.writeLine(`${prefix}'${initialTheme}'`);
  } else {
    writer.writeLine(`${prefix}'main'${suffix}`);
  }

  // Return token code, theme collection, and whether styles exist
  const code = writer.toString();
  return {code, theme, hasStyles};
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

function getColorTokens(themeId: string): ScaleColors {
  return {
    ...getColorScaleVariables(VARIABLE_COLLECTIONS.THEMES, 'colors', themeId),
    ...getColorLocalStyles(),
  };
}

function getColorLocalStyles(): ScaleColors {
  const colors: ScaleColors = {};
  const styles = figma.getLocalPaintStyles();
  styles?.forEach(paint => {
    colors[paint.name] = {
      // @ts-ignore (TODO: expect only solid paints to fix this)
      value: getColor(paint.paints[0]?.color || {r: 0, g: 0, b: 0}),
      comment: paint.description,
    }
  });
  return colors;
}

function getColorScaleVariables(key: string, ns: string, themeId?: string): ScaleColors {
  const colors: ScaleColors = {};
  const collection = getVariableCollection(key);
  if (!collection) return colors;
  collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .filter(v => v.resolvedType === 'COLOR')
    .forEach(v => {
      setVariableCodeSyntax(v, ns);
      if (themeId) {
        const value = v.valuesByMode[themeId] as VariableAlias;
        if (!value && !value.id) return;
        const color = figma.variables.getVariableById(value.id);
        if (!color) return;
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
    });
  return colors;
}

function getFloatScaleVariables(key: string, ns: string): ScaleFloats {
  const scales: ScaleFloats = {};
  const collection = getVariableCollection(key);
  if (!collection) return scales;
  collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .filter(v => v.resolvedType === 'FLOAT')
    .forEach(v => {
      setVariableCodeSyntax(v, ns);
      scales[v.name] = {
        value: parseFloat(parseFloat(v.valuesByMode[collection.defaultModeId].toString()).toFixed(5)),
        comment: v.description,
      }
    });
  return scales;
}

function getFontScaleVariables(key: string, ns: string): {names: string[], refs: ScaleRefs} {
  const names: string[] = [];
  const refs: ScaleRefs = {};
  const collection = getVariableCollection(key);
  if (!collection) return {names: ['Inter'], refs};
  collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .forEach(v => {
      const value = v.valuesByMode[collection.defaultModeId] as any;
      const isRef = value?.type === 'VARIABLE_ALIAS';
      const alias = isRef ? figma.variables.getVariableById(value.id) : null;
      setVariableCodeSyntax(v, ns);
      refs[v.name] = {
        value: isRef ? `typography.${createIdentifierCamel(alias.name)}` : value,
        comment: v.description,
      }
    });
  return {names, refs};
}

function setVariableCodeSyntax(variable: Variable, namespace: string) {
  const id = `theme.${namespace}.${createIdentifierCamel(variable.name)}`;
  if (!isReadOnly() && variable.codeSyntax?.WEB !== id) {
    variable.setVariableCodeSyntax('WEB', id);
  }
}
