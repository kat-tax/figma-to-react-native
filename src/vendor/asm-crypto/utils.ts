export class IllegalStateError extends Error {
  constructor(...args: any[]) {
    super(...args);
    Object.create(Error.prototype, {name: {value: 'IllegalStateError'}});
  }
}

export function heapInit(heap?: Uint8Array, heapSize?: number): Uint8Array {
  const size = heap ? heap.byteLength : heapSize || 65536;
  if (size & 0xfff || size <= 0)
    throw new Error('heap size must be a positive integer and a multiple of 4096');
  heap = heap || new Uint8Array(new ArrayBuffer(size));
  return heap;
}

export function heapWrite(heap: Uint8Array, hpos: number, data: Uint8Array, dpos: number, dlen: number): number {
  const hlen = heap.length - hpos;
  const wlen = hlen < dlen ? hlen : dlen;
  heap.set(data.subarray(dpos, dpos + wlen), hpos);
  return wlen;
}

export function bytesToHex(data: Uint8Array): string {
  let str = '';
  for (let i = 0; i < data.length; i++) {
    let h = (data[i] & 0xff).toString(16);
    if (h.length < 2) str += '0';
    str += h;
  }
  return str;
}
