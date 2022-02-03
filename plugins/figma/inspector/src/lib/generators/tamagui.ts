import type {Settings} from 'lib/types/settings';
import type {TargetNode} from 'lib/types/figma';
import CodeBlockWriter from 'code-block-writer';
import {getContent, getStyle, getName} from 'lib/parsers/figma';

export default function(component: TargetNode, settings: Settings) {
  if (!component) return {name: '', code: ''};

  const name = getName(component.name);
  const writer = new CodeBlockWriter(settings.output?.format);
  const {code, deps, styles} = getContent([...component.children]);
  const root = {tag: 'XStack', slug: 'root', style: getStyle(component)};
  const dependencies = ['XStack', ...deps].join(', ');

  const writeContents = (lines) => {
    lines.forEach((line) => {
      writer.write(`<${line.tag}>`).indent(() => {
        if (line.tag === 'Text') {
          if (settings.output?.react?.addTranslate) {
            writer.write('{t`');
            writer.write(line.value);
            writer.write('`}');
          } else {
            writer.write(line.value);
          }
        } else if (line.tag === 'XStack') {
          writeContents(line.children);
        }
      });
      writer.writeLine(`</${line.tag}>`);
    });
  };

  if (settings.output?.react?.addImport) {
    writer.write('import React from');
    writer.quote('react');
    writer.write(';');
    writer.newLine();
  }

  if (settings.output?.react?.addTranslate && deps.includes('Text')) {
    writer.write('import {t} from');
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  writer.write(`import {${dependencies}} from `);
  writer.quote('tamagui');
  writer.write(';');
  writer.newLine();

  writer.blankLine();

  writer.write(`export function ${name}()`).block(() => {
    writer.write(`return (`).indent(() => {
      writer.write(`<${root.tag}>`).indent(() => {
        writeContents(code);
      });
      writer.writeLine(`</${root.tag}>`);
    });
    writer.writeLine(');');
  });

  writer.newLine();

  return {name, code: writer.toString()};
}
