import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor, getCollectionModes} from 'plugin/fig/lib';

import type {Settings} from 'types/settings';

type ThemeColors = Record<string, ThemeGroup>;
type ThemeGroup = Record<string, ThemeColor> | ThemeColor;
type ThemeColor = {value: string, comment: string};

export function generateTheme(settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const theme = getCollectionModes('Theme');

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

  // Found theme variable collection, convert modes to themes
  if (theme) {
    theme.modes.forEach(mode => {
      writer.write(`export const ${createIdentifierCamel(mode.name)}Theme = `).inlineBlock(() => {
        writeColors(writer, getAllColors(mode.modeId));
      });
      writer.write(';');
      writer.blankLine();
    });
    const themeName = createIdentifierCamel(theme.default.name);
    writer.writeLine(`export default ${themeName}Theme;`);
  // No theme variable collection found, local styles only
  } else {
    writer.write(`export const defaultTheme = `).inlineBlock(() => {
      writeColors(writer, getLocalStylesColors());
    });
    writer.write(';');
    writer.blankLine();
    writer.writeLine(`export default defaultTheme;`);
  }

  return {code: writer.toString(), theme};
}

function writeColors(writer: CodeBlockWriter, colors: ThemeColors) {
  // Write theme colors (if any)
  if (Object.keys(colors).length > 0) {
    writer.write('colors: ').inlineBlock(() => {
      Object.keys(colors).forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group] as ThemeColor;
        writeColor(writer, groupId, groupItem);
        writer.newLine();
      });
    });
    writer.write(',');
    writer.newLine();

  // No colors found, write empty object
  } else {
    writer.write('// No local color styles or color variables found');
  }
}

function writeColor(writer: CodeBlockWriter, name: string, color: ThemeColor) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (color.comment)
    writer.writeLine(`/** ${color.comment} */`);
  writer.write(`${id}: `);
  writer.quote(color.value);
  writer.write(`,`);
}

function getAllColors(themeId: string): ThemeColors {
  return {
    ...getVariableColors(themeId),
    ...getLocalStylesColors(),
  };
}

function getVariableColors(themeId: string): ThemeColors {
  const colors: ThemeColors = {};
  figma.variables
    .getLocalVariables()
    .filter(v => v.resolvedType === 'COLOR')
    .forEach(v => {
      colors[v.name] = {
        value: getColor(v.valuesByMode[themeId] as RGBA),
        comment: v.description,
      }
    });

  return colors;
}

function getLocalStylesColors(): ThemeColors {
  const colors: ThemeColors = {};
  figma.getLocalPaintStyles()
    .forEach(paint => {
      colors[paint.name] = {
        // @ts-ignore (TODO: expect only solid paints to fix this)
        value: getColor(paint.paints[0].color),
        comment: paint.description,
      }
    });

  return colors;
}
