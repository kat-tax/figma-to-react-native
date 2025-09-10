import CodeBlockWriter from 'code-block-writer';
import type {ImportFlags} from './writeImports';

export function writeHookTranslate(
  writer: CodeBlockWriter,
  flags: ImportFlags,
) {
  if (!flags.lingui.useLingui) {
    return false;
  }
  writer.writeLine('const {t} = useLingui();');
  return true;
}
