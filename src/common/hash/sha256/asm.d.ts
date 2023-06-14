declare interface sha256result {
  reset: () => void;
  init: (h0: number, h1: number, h2: number, h3: number, h4: number, total0: number, total1: number) => void;

  /**
   * @param offset - multiple of 64
   * @param length
   * @returns hashed
   */
  process: (offset: number, length: number) => number;

  /**
   * @param offset - multiple of 64
   * @param length
   * @param output - multiple of 32
   * @returns hashed
   */
  finish: (offset: number, length: number, output: number) => number;
}

export function sha256asm(stdlib: any, buffer: ArrayBuffer): sha256result;
