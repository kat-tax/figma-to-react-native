import CodeBlockWriter from 'code-block-writer';
import {getColor} from 'modules/fig/utils';
import {createIdentifierCamel} from 'common/string';

import type {Settings} from 'types/settings';

export function generateTheme(settings: Settings) {
  type ThemeColors = Record<string, Record<string, ThemeColor>>;
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
      // Reproduce Figma's var(...) sanitizer
      const name = token
        // Lowercase string
        ?.toLowerCase()
        // Strip out all non-alphanumeric characters (excluding spaces)
        ?.replace(/[^a-zA-Z0-9\s]+/g, '')
        // Replace spaces with underscores
        ?.replace(/\s/, '_')

      // Name is undefined, skip
      if (!name) return;

      // If the group of colors doesn't exist, initialize it
      if (!colors[group]) {
        colors[group] = {};
      }

      // Insert this color into the color group
      // @ts-ignore (TODO: expect only solid paints to fix this)
      const value = getColor(paint.paints[0].color);
      
      // Value is undefined, skip
      if (!value) return;

      maxLineLength = Math.max(maxLineLength, name.length + value.length);
      colors[group][name] = {value, comment: paint.description};
    });

    // Write theme colors
    if (maxLineLength > 0) {
      writer.write('colors:').space().inlineBlock(() => {
        Object.keys(colors).forEach(group => {
          writer.write(`${createIdentifierCamel(group)}: `).inlineBlock(() => {
            Object.keys(colors[group]).forEach(name => {
              const color: ThemeColor = colors[group][name];
              writer.write(`$${name}: `);
              writer.quote(color.value);
              writer.write(`,`);
              if (color.comment) {
                const padding = (' ').repeat(maxLineLength - (name.length + color.value.length));
                writer.write(`${padding}// ${color.comment}`);
              }
              writer.newLine();
            });
            writer.newLineIfLastNot();
          });
          writer.write(',');
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