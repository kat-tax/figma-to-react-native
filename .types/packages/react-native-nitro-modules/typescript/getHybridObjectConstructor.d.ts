import type { HybridObject } from './HybridObject';
/**
 * Get a constructor function for the given `HybridObject` {@linkcode T}.
 * @param name The name of the `HybridObject` under which it was registered at.
 * @returns A constructor that creates instances of {@linkcode T}
 * @example
 * ```ts
 * export const HybridImage = getHybridObjectConstructor<Image>('Image')
 *
 * const image1 = new HybridImage()
 * const image2 = new HybridImage()
 * image1 instanceof HybridImage // --> true
 * ```
 */
export declare function getHybridObjectConstructor<T extends HybridObject>(name: string): {
    new (): T;
};
//# sourceMappingURL=getHybridObjectConstructor.d.ts.map