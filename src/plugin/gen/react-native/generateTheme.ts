import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor} from 'plugin/fig/lib';

import type {Settings} from 'types/settings';

export function generateTheme(settings: Settings) {
  type ThemeColors = Record<string, ThemeGroup>;
  type ThemeGroup = Record<string, ThemeColor> | ThemeColor;
  type ThemeColor = {value: string, comment: string};

  const writer = new CodeBlockWriter(settings?.writer);
  writer.write('export default').space().inlineBlock(() => {
    let maxLineLength = 0;
    // TODO: skip theme if no values at all
    // TODO: effects styles: console.log('effects', figma.getLocalEffectStyles());
    
    // Build color map
    const colors: ThemeColors = {};
    figma.getLocalPaintStyles().forEach(paint => {
      const [group, token] = paint.name.split('/');

      // Insert this color into the color group
      // @ts-ignore (TODO: expect only solid paints to fix this)
      const value = getColor(paint.paints[0].color);
      const comment = paint.description;
      const data = {value, comment};

      // Token is undefined, it's a single value color
      if (!token) {
        colors[group] = data;
        maxLineLength = Math.max(maxLineLength, value.length);
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

      maxLineLength = Math.max(maxLineLength, subgroup.length + value.length);
      colors[group][subgroup] = data;
    });

    const writeColor = (name: string, color: ThemeColor, singleDepth?: boolean) => {
      const needsPrefix = /^[0-9]/.test(name);
      // const extraSpace = (needsPrefix ? 1 : 0) + (singleDepth ? 0 : 2);
      const id = needsPrefix ? `$${name}` : name;
      writer.write(`${id}: `);
      writer.quote(color.value);
      writer.write(`,`);
      if (color.comment) {
        //const depth = maxLineLength - extraSpace;
        //console.log(depth, name.length, color.value.length, depth - (name.length + color.value.length));
        //const padding = (' ').repeat(depth - (name.length + color.value.length));
        const padding = ' ';
        writer.write(`${padding}// ${color.comment}`);
      }
    }

    // Write theme colors
    if (maxLineLength > 0) {
      writer.write('colors:').space().inlineBlock(() => {
        Object.keys(colors).forEach(group => {
          const groupId = createIdentifierCamel(group);
          const groupItem = colors[group];
          // Single color values
          if (groupItem.value) {
            writeColor(groupId, groupItem as ThemeColor, true);
          // Multi color values
          } else {
            writer.write(`${groupId}: `).inlineBlock(() => {
              Object.keys(groupItem).forEach(name => {
                const color: ThemeColor = groupItem[name];
                writeColor(name, color);
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
    }

    // TODO build font maps
    // console.log('text', figma.getLocalTextStyles());

    // Write font names
    /*
        writer.write('fonts:').space().inlineBlock(() => {
          // TODO
        });
        writer.write(',');
        writer.newLine();

        // Write font weights
        writer.write('fontWeights:').space().inlineBlock(() => {
          // TODO
        });
        writer.write(',');
        writer.newLine();

        // Write line heights
        writer.write('lineHeights:').space().inlineBlock(() => {
          // TODO
        });
        writer.write(',');
        writer.newLine();
    */

    if (maxLineLength === 0) {
      writer.write('// No figma styles found');
    }
  });
  writer.write(';');
  writer.newLine();

  return writer.toString();
}

/*
{
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#07c',
    secondary: '#05a',
    accent: '#609',
    muted: '#f6f6f6',
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'system-ui, sans-serif',
    monospace: 'Menlo, monospace',
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
}
*/