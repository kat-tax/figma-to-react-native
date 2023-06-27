export function encode(uint8Array: Uint8Array): string {
  let base64 = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  let padding = 0;
  let paddingChar = '=';

  for (let i = 0; i < uint8Array.length; i += 3) {
    const byte1 = uint8Array[i];
    const byte2 = uint8Array[i + 1];
    const byte3 = uint8Array[i + 2];

    const index1 = byte1 >> 2;
    const index2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const index3 = ((byte2 & 15) << 2) | (byte3 >> 6);
    const index4 = byte3 & 63;

    base64 +=
      characters.charAt(index1) +
      characters.charAt(index2) +
      characters.charAt(index3) +
      characters.charAt(index4);
  }

  const remaining = uint8Array.length % 3;
  if (remaining === 1) {
    const byte1 = uint8Array[uint8Array.length - 1];
    const index1 = byte1 >> 2;
    const index2 = (byte1 & 3) << 4;

    base64 += characters.charAt(index1) + characters.charAt(index2);
    padding = 2;
  } else if (remaining === 2) {
    const byte1 = uint8Array[uint8Array.length - 2];
    const byte2 = uint8Array[uint8Array.length - 1];
    const index1 = byte1 >> 2;
    const index2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const index3 = (byte2 & 15) << 2;

    base64 +=
      characters.charAt(index1) +
      characters.charAt(index2) +
      characters.charAt(index3);
    padding = 1;
  }

  return base64 + paddingChar.repeat(padding);
}