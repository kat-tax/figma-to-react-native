import CodeBlockWriter from 'code-block-writer';
import {getSlug, getColor} from 'utils/figma';

import type {Settings} from 'types/settings';

export function generateTheme(settings: Settings) {
  type ThemeColors = Record<string, Record<string, ThemeColor>>;
  type ThemeColor = {value: string, comment: string};

  // Create theme writer
  const writer = new CodeBlockWriter(settings.output?.format);

  // TODO
  // - text & effects
  // - skip theme if no values at all
  // console.log('text', figma.getLocalTextStyles());
  // console.log('effects', figma.getLocalEffectStyles());
  
  // Build color map
  const colors: ThemeColors = {};
  let maxLineLength = 0;
  figma.getLocalPaintStyles().forEach(paint => {
    const [group, token] = paint.name.split('/');
    const name = getSlug(token, true);

    // If the group of colors doesn't exist, initialize it
    if (!colors[group]) {
      colors[group] = {};
    }

    // Insert this color into the color group
    // @ts-ignore (TODO: expect only solid paints to fix this)
    const value = getColor(paint.paints[0].color);
    maxLineLength = Math.max(maxLineLength, name.length + value.length);
    colors[group][name] = {value, comment: paint.description};
  });

  // Write theme colors
  writer.write('export default').space().inlineBlock(() => {
    Object.keys(colors).forEach(group => {
      writer.write(`${getSlug(group)}: `).inlineBlock(() => {
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