export function encodeUTF8(str: string) {
  const utf8 = [];

  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);

    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push((charCode >> 6) | 192);
      utf8.push((charCode & 63) | 128);
    } else {
      utf8.push((charCode >> 12) | 224);
      utf8.push(((charCode >> 6) & 63) | 128);
      utf8.push((charCode & 63) | 128);
    }
  }

  return new Uint8Array(utf8);
}
