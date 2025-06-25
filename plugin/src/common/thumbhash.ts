/**
 * Encodes an RGBA image to a ThumbHash. RGB should not be premultiplied by A.
 *
 * @param w The width of the input image. Must be ≤100px.
 * @param h The height of the input image. Must be ≤100px.
 * @param rgba The pixels in the input image, row-by-row. Must have w*h*4 elements.
 * @returns The ThumbHash as a Uint8Array.
 */
export function rgbaToThumbHash(w: number, h: number, rgba: ArrayLike<number>): Uint8Array {
  // Encoding an image larger than 100x100 is slow with no benefit
  if (w > 100 || h > 100) throw new Error(`${w}x${h} doesn't fit in 100x100`)
  let { PI, round, max, cos, abs } = Math

  // Determine the average color
  let avg_r = 0, avg_g = 0, avg_b = 0, avg_a = 0
  for (let i = 0, j = 0; i < w * h; i++, j += 4) {
    let alpha = rgba[j + 3] / 255
    avg_r += alpha / 255 * rgba[j]
    avg_g += alpha / 255 * rgba[j + 1]
    avg_b += alpha / 255 * rgba[j + 2]
    avg_a += alpha
  }
  if (avg_a) {
    avg_r /= avg_a
    avg_g /= avg_a
    avg_b /= avg_a
  }

  let hasAlpha = avg_a < w * h
  let l_limit = hasAlpha ? 5 : 7 // Use fewer luminance bits if there's alpha
  let lx = max(1, round(l_limit * w / max(w, h)))
  let ly = max(1, round(l_limit * h / max(w, h)))
  let l: number[] = []; // Luminance
  let p: number[] = []; // Yellow - Blue
  let q: number[] = []; // Red - Green
  let a: number[] = []; // Alpha

  // Convert the image from RGBA to LPQA (composite atop the average color)
  for (let i = 0, j = 0; i < w * h; i++, j += 4) {
    let alpha = rgba[j + 3] / 255
    let r = avg_r * (1 - alpha) + alpha / 255 * rgba[j]
    let g = avg_g * (1 - alpha) + alpha / 255 * rgba[j + 1]
    let b = avg_b * (1 - alpha) + alpha / 255 * rgba[j + 2]
    l[i] = (r + g + b) / 3
    p[i] = (r + g) / 2 - b
    q[i] = r - g
    a[i] = alpha
  }

  // Encode using the DCT into DC (constant) and normalized AC (varying) terms
  const encodeChannel = (channel: number[], nx: number, ny: number): [number, number[], number] => {
    let dc = 0, ac = [], scale = 0, fx = []
    for (let cy = 0; cy < ny; cy++) {
      for (let cx = 0; cx * ny < nx * (ny - cy); cx++) {
        let f = 0
        for (let x = 0; x < w; x++)
          fx[x] = cos(PI / w * cx * (x + 0.5))
        for (let y = 0; y < h; y++)
          for (let x = 0, fy = cos(PI / h * cy * (y + 0.5)); x < w; x++)
            f += channel[x + y * w] * fx[x] * fy
        f /= w * h
        if (cx || cy) {
          ac.push(f)
          scale = max(scale, abs(f))
        } else {
          dc = f
        }
      }
    }
    if (scale)
      for (let i = 0; i < ac.length; i++)
        ac[i] = 0.5 + 0.5 / scale * ac[i]
    return [dc, ac, scale]
  }

  let [l_dc, l_ac, l_scale] = encodeChannel(l, max(3, lx), max(3, ly))
  let [p_dc, p_ac, p_scale] = encodeChannel(p, 3, 3)
  let [q_dc, q_ac, q_scale] = encodeChannel(q, 3, 3)
  let [a_dc, a_ac, a_scale] = hasAlpha ? encodeChannel(a, 5, 5) : []

  // Write the constants
  let isLandscape = w > h
  let header24 = round(63 * l_dc) | (round(31.5 + 31.5 * p_dc) << 6) | (round(31.5 + 31.5 * q_dc) << 12) | (round(31 * l_scale) << 18) | (hasAlpha as unknown as number << 23)
  let header16 = (isLandscape ? ly : lx) | (round(63 * p_scale) << 3) | (round(63 * q_scale) << 9) | (isLandscape as unknown as number << 15)
  let hash = [header24 & 255, (header24 >> 8) & 255, header24 >> 16, header16 & 255, header16 >> 8]
  let ac_start = hasAlpha ? 6 : 5
  let ac_index = 0
  if (hasAlpha) hash.push(round(15 * a_dc) | (round(15 * a_scale) << 4))

  // Write the varying factors
  for (let ac of hasAlpha ? [l_ac, p_ac, q_ac, a_ac] : [l_ac, p_ac, q_ac])
    for (let f of ac)
      hash[ac_start + (ac_index >> 1)] |= round(15 * f) << ((ac_index++ & 1) << 2)
  return new Uint8Array(hash)
}

/**
 * Converts a bytearray into a base64 string without using btoa.
 * @param byteArray - The bytearray to convert.
 * @returns The base64 encoded string.
 */
export function byteArrayToBase64(byteArray: Uint8Array): string {
  const base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  const len = byteArray.length;

  while (i < len) {
      const bin1 = byteArray[i++] & 0xFF;
      if (i === len) {
          result += base64Characters.charAt(bin1 >> 2);
          result += base64Characters.charAt((bin1 & 0x3) << 4);
          result += '==';
          break;
      }

      const bin2 = byteArray[i++] & 0xFF;
      if (i === len) {
          result += base64Characters.charAt(bin1 >> 2);
          result += base64Characters.charAt(((bin1 & 0x3) << 4) | (bin2 >> 4));
          result += base64Characters.charAt((bin2 & 0xF) << 2);
          result += '=';
          break;
      }

      const bin3 = byteArray[i++] & 0xFF;
      result += base64Characters.charAt(bin1 >> 2);
      result += base64Characters.charAt(((bin1 & 0x3) << 4) | (bin2 >> 4));
      result += base64Characters.charAt(((bin2 & 0xF) << 2) | (bin3 >> 6));
      result += base64Characters.charAt(bin3 & 0x3F);
  }

  return result;
}