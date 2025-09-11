/**
 * Represents a single value inside an untyped map.
 */
export type ValueType = string | number | boolean | bigint | null | ValueType[] | {
    [k: string]: ValueType;
};
/**
 * Represents an untyped map, similar to a JSON structure.
 * Supported types:
 * - Primitives (`string`, `number`, `boolean`, `bigint`, `null`)
 * - Arrays of primitives (`ValueType[]`)
 * - Objects of primitives (`Record<string, ValueType>`)
 * - Arrays of arrays or objects
 * - Objects of arrays or objects
 *
 * @note It is recommended to always use typed `interface`s instead of `AnyMap` for
 * both type safety, as well as better performance.
 */
export type AnyMap = Record<string, ValueType>;
//# sourceMappingURL=AnyMap.d.ts.map