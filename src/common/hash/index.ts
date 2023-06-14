import {Sha256} from './sha256';
import {bytesToHex} from './utils';

export function hashString(value: string) {
  const array = new TextEncoder().encode(value);
  return bytesToHex(Sha256.bytes(array));
}
