import {blake2sHex} from 'blakejs';
import {encodeUTF8} from 'common/encoder';

export async function translate(language: VariableCollection, value: string) {
  if (language) {
    const {id, defaultModeId} = language;
    try {
      const bytes = encodeUTF8(value);
      const hash = blake2sHex(bytes);
      const vars = await figma.variables.getLocalVariablesAsync();
      if (!vars.find(e => e.name === hash)) {
        const entry = figma.variables.createVariable(hash, id, 'STRING');
        entry.setValueForMode(defaultModeId, value);
      }
    } catch (e) {
      console.log(`Unable to create language ${value}`, e);
    }
  }
}
