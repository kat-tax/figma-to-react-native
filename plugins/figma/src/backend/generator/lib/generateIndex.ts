import CodeBlockWriter from 'code-block-writer';

import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';

export function generateIndex(
  components: ComponentInfo[],
  settings: ProjectSettings,
  isMainIndex: boolean = false,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  components.forEach((component) => {
    writer.write(`export {${component.name}} from `);
    writer.quote(isMainIndex ? `./${component.path}` : `./${component.name}`);
    writer.write(';');
    writer.newLine();
  });
  return writer.toString();
}
