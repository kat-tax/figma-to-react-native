import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor, getCollectionModes} from 'backend/fig/lib';
import {VARIABLE_COLLECTIONS} from 'backend/gen/lib/consts';

import type {ProjectSettings} from 'types/settings';

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

export function generateTokens(settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);
  writer.writeLine('export type Themes = keyof typeof themes;');
  writer.blankLine();
  writeDisplay(writer);
  const fonts = writeFonts(writer);
  writePallete(writer);
  const themes = writeThemes(writer);
  return {fonts, themes};
}

// Sections

function writeDisplay(writer: CodeBlockWriter) {
  const display = getFloatScaleVariables(VARIABLE_COLLECTIONS.SCALE_DISPLAY);

  writer.write('export const breakpoints = {').indent(() => {
    // Write breakpoints (if any)
    const keys = Object.keys(display).filter(k => k.includes('Breakpoint/'));
    if (keys.length > 0) {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group.split('/').pop());
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

  writer.write('export const display = {').indent(() => {
    // Write display scales (if any)
    const keys = Object.keys(display).filter(k => !k.includes('Breakpoint/'));
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
  const font = getFontScaleVariables(VARIABLE_COLLECTIONS.FONTS);
  const typography = getFloatScaleVariables(VARIABLE_COLLECTIONS.SCALE_FONTS);

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

function writePallete(writer: CodeBlockWriter) {
  const colors = getColorScaleVariables(VARIABLE_COLLECTIONS.SCALE_COLORS);

  writer.write('export const pallete = {').indent(() => {
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
  const theme = getCollectionModes(VARIABLE_COLLECTIONS.COLORS);
  let hasStyles = false;

  writer.write('export const themes = {').indent(() => {
    // Theme variable collection found, write modes to themes
    if (theme) {
      theme.modes.forEach(mode => {
        writer.write(`${createIdentifierCamel(mode.name)}: `).inlineBlock(() => {
          hasStyles = writeColors(writer, getColorTokens(mode.modeId));
          writer.writeLine('...display,');
          writer.writeLine('...pallete,');
          writer.writeLine('...typography,');
          writer.writeLine('...font,');
        });
        writer.write(',');
        writer.newLine();
      });
    // No theme variable collection found, local styles only
    } else {
      writer.write(`main: `).inlineBlock(() => {
        hasStyles = writeColors(writer, getColorLocalStyles());
      });
      writer.write(',');
      writer.newLine();
    }
  }).writeLine(`} as const;`);

  writer.blankLine();

  // Default theme export
  if (theme) {
    const initialTheme = createIdentifierCamel(theme.default.name);
    writer.writeLine(`export const initialTheme: Themes = '${initialTheme}'`);
  } else {
    writer.writeLine(`export const initialTheme: Themes = 'main'`);
  }

  // Return token code, theme collection, and whether styles exist
  const code = writer.toString();
  return {code, theme, hasStyles};
}

// Helpers

function writeColors(writer: CodeBlockWriter, colors: ScaleColors) {
  // Write theme colors (if any)
  const keys = Object.keys(colors);
  if (keys.length > 0) {
    writer.write('colors: ').inlineBlock(() => {
      keys.forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group] as ScaleColorToken;
        writeColorToken(writer, groupId, groupItem);
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

function writeColorToken(writer: CodeBlockWriter, name: string, color: ScaleColorToken) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (color.comment)
    writer.writeLine(`/** ${color.comment} */`);
  writer.write(`${id}: `);
  if (color.value.startsWith('pallete.')) {
    writer.write(color.value);
  } else {
    writer.quote(color.value);
  }
  writer.write(`,`);
}

function writeScaleToken(writer: CodeBlockWriter, name: string, scale: ScaleToken) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (scale.comment)
    writer.writeLine(`/** ${scale.comment} */`);
  if (typeof scale.value === 'number' || scale.value.includes('.')) {
    writer.write(`${id}: ${scale.value},`);
  } else {
    writer.write(`${id}: `);
    writer.quote(scale.value);
    writer.write(',');
  }
}

// Utilities

function getColorTokens(themeId: string): ScaleColors {
  return {
    ...getColorVariables(themeId),
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

function getColorVariables(themeId: string): ScaleColors {
  const colors: ScaleColors = {};
  const collection = figma.variables
    ?.getLocalVariableCollections()
    ?.find(c => c.name === VARIABLE_COLLECTIONS.COLORS);
  
  if (!collection) return colors;

  collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .filter(v => v.resolvedType === 'COLOR')
    .forEach(v => {
      const value = v.valuesByMode[themeId] as VariableAlias;
      if (!value && !value.id) return;
      const color = figma.variables.getVariableById(value.id);
      if (!color) return;
      colors[v.name] = {
        value: `pallete.${createIdentifierCamel(color.name)}`,
        comment: v.description,
      }
    });
  return colors;
}

function getColorScaleVariables(collectionName: string): ScaleColors {
  const colors: ScaleColors = {};
  const collection = figma.variables
    ?.getLocalVariableCollections()
    ?.find(c => c.name === collectionName);

  if (!collection) return colors;

  collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .filter(v => v.resolvedType === 'COLOR')
    .forEach(v => {
      colors[v.name] = {
        value: getColor(v.valuesByMode[collection.defaultModeId] as RGBA),
        comment: v.description,
      }
    });

  return colors;
}

function getFloatScaleVariables(collectionName: string): ScaleFloats {
  const scales: ScaleFloats = {};
  const collection = figma.variables
    ?.getLocalVariableCollections()
    ?.find(c => c.name === collectionName);

  if (!collection) return scales;

  collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .filter(v => v.resolvedType === 'FLOAT')
    .forEach(v => {
      scales[v.name] = {
        value: parseFloat(parseFloat(v.valuesByMode[collection.defaultModeId].toString()).toFixed(5)),
        comment: v.description,
      }
    });

  return scales;
}

function getFontScaleVariables(collectionName: string): {names: string[], refs: ScaleRefs} {
  const names: string[] = [];
  const refs: ScaleRefs = {};

  const collection = figma.variables
    ?.getLocalVariableCollections()
    ?.find(c => c.name === collectionName);

  if (!collection) return {names: ['Inter'], refs};

  collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .forEach(v => {
      const value = v.valuesByMode[collection.defaultModeId] as any;
      const isRef = value?.type === 'VARIABLE_ALIAS';
      const alias = isRef ? figma.variables.getVariableById(value.id) : null;
      refs[v.name] = {
        value: isRef ? `typography.${createIdentifierCamel(alias.name)}` : value,
        comment: v.description,
      }
    });

  return {names, refs};
}
