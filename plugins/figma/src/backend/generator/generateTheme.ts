import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor, getCollectionModes} from 'backend/parser/lib';

import type {ProjectSettings} from 'types/settings';

type ThemeColors = Record<string, ThemeGroup>;
type ThemeGroup = Record<string, ThemeColor> | ThemeColor;
type ThemeColor = {value: string, comment: string};

export function generateTheme(settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const theme = getCollectionModes('Theme');

  let hasStyles = false;

  // Write breakpoints
  // TODO: support custom breakpoints
  writer.write('export const breakpoints = ').inlineBlock(() => {
    writer.writeLine('xs: 0,');
    writer.writeLine('sm: 576,');
    writer.writeLine('md: 768,');
    writer.writeLine('lg: 992,');
    writer.writeLine('xl: 1200,');
  });

  writer.blankLine();

  // Write color tokens
  writer.write('export const pallete = ').inlineBlock(() => {
    writeColorTokens(writer, getColorTokenVariables());
  });

  writer.blankLine();

  // Write themes
  writer.write('export const themes = ').inlineBlock(() => {
    // Theme variable collection found, write modes to themes
    if (theme) {
      theme.modes.forEach(mode => {
        writer.write(`${createIdentifierCamel(mode.name)}: `).inlineBlock(() => {
          hasStyles = writeThemeTokens(writer, getAllThemeTokens(mode.modeId));
        });
        writer.write(',');
        writer.newLine();
      });
    // No theme variable collection found, local styles only
    } else {
      writer.write(`main: `).inlineBlock(() => {
        hasStyles = writeThemeTokens(writer, getThemeTokenLocalStyles());
      });
      writer.write(',');
      writer.newLine();
    }
  });

  writer.blankLine();

  // Write default export
  if (theme) {
    const initialTheme = createIdentifierCamel(theme.default.name);
    writer.writeLine(`export default '${initialTheme}'`);
  } else {
    writer.writeLine(`export default 'main'`);
  }
    
  return {code: writer.toString(), theme, hasStyles};
}

function writeColorTokens(writer: CodeBlockWriter, colors: ThemeColors) {
  // Write color scales (if any)
  if (Object.keys(colors).length > 0) {
    Object.keys(colors).forEach(group => {
      const groupId = createIdentifierCamel(group);
      const groupItem = colors[group] as ThemeColor;
      writeColorToken(writer, groupId, groupItem);
      writer.newLine();
    });
  // No colors found, write empty object
  } else {
    writer.write('// No color variables found');
  }
}

function writeColorToken(writer: CodeBlockWriter, name: string, color: ThemeColor) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (color.comment)
    writer.writeLine(`/** ${color.comment} */`);
  writer.write(`${id}: `);
  writer.quote(color.value);
  writer.write(`,`);
}

function writeThemeTokens(writer: CodeBlockWriter, colors: ThemeColors) {
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
  const collection = figma.variables.getLocalVariableCollections()?.find(c => c.name === 'Colors');
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