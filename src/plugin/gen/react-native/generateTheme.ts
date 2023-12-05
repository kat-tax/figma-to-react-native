import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getCollectionModes} from 'plugin/fig/traverse';
import {getColor} from 'plugin/fig/lib';

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
    writer.write(`export default `).inlineBlock(() => {
      writeColors(writer, getLocalStylesColors());
    });
    writer.write(';');
    writer.newLine();
  }

  return {code: writer.toString(), theme};
}

function writeColors(writer: CodeBlockWriter, colors: ThemeColors) {
  // Write theme colors (if any)
  if (Object.keys(colors).length > 0) {
    writer.write('colors: ').inlineBlock(() => {
      Object.keys(colors).forEach(group => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group];
        // Single color values
        if (groupItem.value) {
          writeColor(writer, groupId, groupItem as ThemeColor);
        // Multi color values
        } else {
          writer.write(`${groupId}: `).inlineBlock(() => {
            Object.keys(groupItem).forEach(name => {
              const color: ThemeColor = groupItem[name];
              writeColor(writer, name, color);
              writer.newLine();
            });
            writer.newLineIfLastNot();
          });
          writer.write(',');
        }
        writer.newLine();
      });
    });
    writer.write(',');
    writer.newLine();

  // No colors found, write empty object
  } else {
    writer.write('// No figma styles found');
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
  // Build color map
  const colors: ThemeColors = {};
  figma.getLocalPaintStyles().forEach(paint => {
    // TODO: support infinitely deep color groups
    const [group, token] = paint.name.split('/');

    // Insert this color into the color group
    // @ts-ignore (TODO: expect only solid paints to fix this)
    const value = getColor(paint.paints[0].color);
    const comment = paint.description;
    const data = {value, comment};

    // Token is undefined, it's a single value color
    if (!token) {
      colors[group] = data;
      return;
    }

    // Reproduce Figma's var(...) sanitizer
    const subgroup = token
      // Lowercase string
      ?.toLowerCase()
      // Strip out all non-alphanumeric characters (excluding spaces)
      ?.replace(/[^a-zA-Z0-9\s]+/g, '')
      // Replace spaces with underscores
      ?.replace(/\s/g, '_')

    // If the group of colors doesn't exist, initialize it
    if (!colors[group]) {
      colors[group] = {};
    }
    
    // Value is undefined, skip
    if (!value) return;

    colors[group][subgroup] = data;
  });

  return colors;
}
