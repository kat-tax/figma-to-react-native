import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor, getCollectionModes} from 'backend/fig/lib';

import type {ProjectSettings} from 'types/settings';

type ThemeColors = Record<string, ThemeGroup>;
type ThemeGroup = Record<string, ThemeColor> | ThemeColor;
type ThemeColor = {value: string, comment: string};

export function generateTokens(settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);
  writeBreakpoints(writer);
  //writeLayout(writer);
  writePallete(writer);
  return writeThemes(writer);
}

// Sections

function writeBreakpoints(writer: CodeBlockWriter) {
  writer.write('export const breakpoints = ').inlineBlock(() => {
    writer.writeLine('xs: 0,');
    writer.writeLine('sm: 576,');
    writer.writeLine('md: 768,');
    writer.writeLine('lg: 992,');
    writer.writeLine('xl: 1200,');
  });
  writer.blankLine();
}

function writeLayout(writer: CodeBlockWriter) {
  writer.write('export const layout = ').inlineBlock(() => {
    figma.variables.getLocalVariables()?.forEach(v => {
      const collection = figma.variables.getVariableCollectionById(v.variableCollectionId);
      const value = v.valuesByMode[collection.defaultModeId].toString();
      const id = createIdentifierCamel(v.name);
      switch (v.resolvedType) {
        case 'COLOR':
          writer.writeLine(`${createIdentifierCamel(v.name)}: ${value},`);
          break;
        case 'STRING':
          writer.writeLine(`${createIdentifierCamel(v.name)}: ${value},`);
          break;
        case 'FLOAT':
          writer.writeLine(`${createIdentifierCamel(v.name)}: ${value},`);
          break;
        case 'BOOLEAN':
          writer.writeLine(`${createIdentifierCamel(v.name)}: ${value},`);
          break;
      }
    });
  });
  writer.blankLine();
}

function writePallete(writer: CodeBlockWriter) {
  const colors = getColorTokenVariables();
  writer.write('export const pallete = ').inlineBlock(() => {
    // Write color scales (if any)
    if (Object.keys(colors).length > 0) {
      Object.keys(colors).forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group] as ThemeColor;
        writeColor(writer, groupId, groupItem);
        writer.newLine();
      });
    // No colors found, write empty object
    } else {
      writer.write('// No color variables found');
    }
  });
  writer.blankLine();
}

function writeThemes(writer: CodeBlockWriter) {
  let hasStyles = false;
  const theme = getCollectionModes('Theme');
  writer.write('export const themes = ').inlineBlock(() => {
    // Theme variable collection found, write modes to themes
    if (theme) {
      theme.modes.forEach(mode => {
        writer.write(`${createIdentifierCamel(mode.name)}: `).inlineBlock(() => {
          hasStyles = writeTheme(writer, getAllThemeTokens(mode.modeId));
        });
        writer.write(',');
        writer.newLine();
      });
    // No theme variable collection found, local styles only
    } else {
      writer.write(`main: `).inlineBlock(() => {
        hasStyles = writeTheme(writer, getThemeTokenLocalStyles());
      });
      writer.write(',');
      writer.newLine();
    }
  });
  // Default theme export
  writer.blankLine();
  if (theme) {
    const initialTheme = createIdentifierCamel(theme.default.name);
    writer.writeLine(`export default '${initialTheme}'`);
  } else {
    writer.writeLine(`export default 'main'`);
  }
  // Return token code, theme collection, and whether styles exist
  const code = writer.toString();
  return {code, theme, hasStyles};
}

// Utilities

function writeColor(writer: CodeBlockWriter, name: string, color: ThemeColor) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (color.comment)
    writer.writeLine(`/** ${color.comment} */`);
  writer.write(`${id}: `);
  writer.quote(color.value);
  writer.write(`,`);
}

function writeTheme(writer: CodeBlockWriter, colors: ThemeColors) {
  // Write theme colors (if any)
  if (Object.keys(colors).length > 0) {
    writer.write('colors: ').inlineBlock(() => {
      Object.keys(colors).forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group] as ThemeColor;
        writeThemeToken(writer, groupId, groupItem);
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

function writeThemeToken(writer: CodeBlockWriter, name: string, color: ThemeColor) {
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

function getAllThemeTokens(themeId: string): ThemeColors {
  return {
    ...getThemeTokenVariables(themeId),
    ...getThemeTokenLocalStyles(),
  };
}

function getThemeTokenLocalStyles(): ThemeColors {
  const colors: ThemeColors = {};
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

function getThemeTokenVariables(themeId: string): ThemeColors {
  const colors: ThemeColors = {};
  const collection = figma.variables.getLocalVariableCollections()?.find(c => c.name === 'Theme');
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

function getColorTokenVariables(): ThemeColors {
  const colors: ThemeColors = {};
  const collection = figma.variables
    ?.getLocalVariableCollections()
    ?.find(c => c.name === 'Colors');

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
