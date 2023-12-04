import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';

import type {ParseData} from 'types/parse';
import type {Settings} from 'types/settings';

export function writeImports(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
) {
  // Import React
  writer.write('import React from');
  writer.space();
  writer.quote('react');
  writer.write(';');
  writer.newLine();

  // Import LinguiJS if set and Text primitive is used
  if (settings?.react?.addTranslate && data.meta.primitives.has('Text')) {
    writer.write('import {Trans} from');
    writer.space();
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  // Import primitives
  const imports = [
    ...data.meta.primitives,
    data.root.click?.type === 'URL' && 'Pressable',
  ].filter(Boolean);
  writer.write(`import {${(imports.length ? imports : ['View']).join(', ')}} from`);
  writer.space();
  writer.quote('react-native');
  writer.write(';');
  writer.newLine();

  // Import Unistyles helpers
  writer.write(`import {useStyles, createStyleSheet} from`);
  writer.space();
  writer.quote(`styles`);
  writer.write(';');
  writer.newLine();

  // TODO: aria hooks for each primitive
  // writer.writeLine(`import {useButton} from '@react-native-aria/button';`);
  // writer.writeLine(`import {useHover} from '@react-native-aria/interactions';`);
  // writer.writeLine(`import {useFocusRing} from '@react-native-aria/focus';`);
  // writer.newLine();

  // Import subcomponents
  Object
    .entries(data.meta.components)
    .sort((a, b) => a[1][0].name.localeCompare(b[1][0].name))
    .forEach(([_id, [node, _instance]]) => {
      const component = createIdentifierPascal(node.name);
      writer.write(`import {${component}} from`);
      writer.space();
      writer.quote(`components/${component}`);
      writer.write(';');
      writer.newLine();
    });

  // Import assets
  Object
    .entries(data.assetData)
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .forEach(([_id, asset]) => {
    writer.write(`import ${asset.name} from`);
    writer.space();
    const base = `assets/${asset.isVector ? 'vectors' : 'rasters'}`;
    const path = `${base}/${asset.name}.${asset.isVector ? 'svg' : 'png'}`;
    writer.quote(path);
    writer.write(';');
    writer.newLine();
  });

  writer.blankLine();

  writer.write(`import type {GestureResponderEvent, PressableStateCallbackType} from`);
  writer.space();
  writer.quote(`react-native`);
  writer.write(';');
  writer.newLine();
}
