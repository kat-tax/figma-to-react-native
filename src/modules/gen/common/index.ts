import CodeBlockWriter from 'code-block-writer';

import type {Settings} from 'types/settings';

export function generateIndex(names: Set<string>, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  names.forEach(name => {
    writer.write(`export {${name}} from `);
    writer.quote(`./${name}`);
    writer.write(';');
    writer.newLine();
  }); 
  writer.newLine();
  return writer.toString();
}
