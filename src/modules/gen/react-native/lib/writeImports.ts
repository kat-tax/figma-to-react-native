import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';

import type {ParseData} from 'types/figma';
import type {Settings} from 'types/settings';

export function writeImports(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  isPreview?: boolean,
) {
  // Import React explicitly if set 
  if (settings?.react?.addImport) {
    writer.write('import React from');
    writer.space();
    writer.quote('react');
    writer.write(';');
    writer.newLine();
  }

  // Import LinguiJS if set and Text primitive is used
  if (settings?.react?.addTranslate && data.meta.primitives.has('Text')) {
    writer.write('import {Trans} from');
    writer.space();
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  // Import primitives
  writer.write(`import {StyleSheet, ${['View', ...data.meta.primitives].join(', ')}} from`);
  writer.space();
  writer.quote('react-native');
  writer.write(';');
  writer.newLine();

  if (!isPreview) {
    // Import subcomponents
    Object.entries(data.meta.components).forEach(([_id, node]) => {
      const component = createIdentifierPascal(node.name);
      writer.write(`import {${component}} from`);
      writer.space();
      writer.quote(`components/${component}`);
      writer.write(';');
      writer.newLine();
    });

    // Import assets
    Object.entries(data.assets).forEach(([_id, asset]) => {
      writer.write(`import ${asset.name} from`);
      writer.space();
      const base = `assets/${asset.isVector ? 'vectors' : 'images'}`;
      const path = `${base}/${asset.name}.${asset.isVector ? 'svg' : 'png'}`;
      writer.quote(path);
      writer.write(';');
      writer.newLine();
    });

    // Import theme file (TODO: do not include if no theme properties are used)
    writer.write(`import theme from`);
    writer.space();
    writer.quote(`theme`);
    writer.write(';');
    writer.newLine();
  }
}
