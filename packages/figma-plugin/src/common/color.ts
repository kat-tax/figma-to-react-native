export function rgbToHex(r: number, g: number, b: number, a?: number) {
  const hexValue = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  if (a !== undefined && a !== 1) {
    const alphaValue = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${hexValue}${alphaValue}`;
  }
  return `#${hexValue}`;
}
