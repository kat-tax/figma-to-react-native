import {heapInit, heapWrite, IllegalStateError} from '../utils';
import {sha256asm, sha256result} from './asm';

export const sha256HashSize = 32;
export const sha256BlockSize = 64;

const heap_pool: Uint8Array[] = [];
const asm_pool: sha256result[] = [];

export abstract class Hash<T extends sha256result> {
  public result!: Uint8Array | null;
  public pos: number = 0;
  public len: number = 0;
  public asm!: T | undefined;
  public heap!: Uint8Array | undefined;
  public BLOCK_SIZE!: number;
  public HASH_SIZE!: number;

  abstract acquire_asm(): {heap: Uint8Array, asm: T};
  abstract release_asm(): void;

  reset() {
    const {asm} = this.acquire_asm();
    this.result = null;
    this.pos = 0;
    this.len = 0;
    asm.reset();
    return this;
  }

  process(data: Uint8Array) {
    if (this.result !== null)
      throw new IllegalStateError('state must be reset before processing new data');

    const {asm, heap} = this.acquire_asm();
    let hpos = this.pos;
    let hlen = this.len;
    let dpos = 0;
    let dlen = data.length;
    let wlen = 0;

    while (dlen > 0) {
      wlen = heapWrite(heap, hpos + hlen, data, dpos, dlen);
      hlen += wlen;
      dpos += wlen;
      dlen -= wlen;
      wlen = asm.process(hpos, hlen);
      hpos += wlen;
      hlen -= wlen;
      if (!hlen)
        hpos = 0;
    }

    this.pos = hpos;
    this.len = hlen;
    return this;
  }

  finish() {
    if (this.result !== null)
      throw new IllegalStateError('state must be reset before processing new data');
    const {asm, heap} = this.acquire_asm();
    asm.finish(this.pos, this.len, 0);
    this.result = new Uint8Array(this.HASH_SIZE);
    this.result.set(heap.subarray(0, this.HASH_SIZE));
    this.pos = 0;
    this.len = 0;
    this.release_asm();
    return this;
  }
}

export class Sha256 extends Hash<sha256result> {
  static NAME = 'sha256';
  public NAME = 'sha256';
  public HASH_SIZE = sha256HashSize;
  public BLOCK_SIZE = sha256BlockSize;

  constructor() {
    super();
    this.acquire_asm();
  }

  acquire_asm(): {heap: Uint8Array, asm: sha256result} {
    if (this.heap === undefined || this.asm === undefined) {
      this.heap = heap_pool.pop() || heapInit();
      this.asm = asm_pool.pop() || sha256asm({Uint8Array: Uint8Array}, this.heap.buffer);
      this.reset();
    }
    return {heap: this.heap, asm: this.asm};
  }

  release_asm() {
    if (this.heap !== undefined && this.asm !== undefined) {
      heap_pool.push(this.heap);
      asm_pool.push(this.asm);
    }
    this.heap = undefined;
    this.asm = undefined;
  }

  static bytes(data: Uint8Array): Uint8Array {
    return new Sha256().process(data).finish().result;
  }
}
