import CodeBlockWriter from 'code-block-writer';

import type {Settings} from 'types/settings';

export function generateIndex(
  names: Set<string>,
  settings: Settings,
  isMainIndex: boolean = false,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const prefix = isMainIndex ? './components/' : './';
  names.forEach(name => {
    writer.write(`export {${name}} from `);
    writer.quote(`${prefix}${name}`);
    writer.write(';');
    writer.newLine();
  }); 
  writer.newLine();
  return writer.toString();
}
