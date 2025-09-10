import { Storage } from 'redux-persist';
/**
 * A service to manage persistent KV databases.
 *
 * Supports `string`, `number`, `boolean`, and `ArrayBuffer` values, indexed by `string` keys.
 */
export interface KVBase {
    /**
     * Initializes a KV database
     *
     * @param id The unique identifier for the database
     * @param version The version of the database
     * @returns The KV database
     */
    init(id: string, version: number): KVDatabase;
}
/**
 * The KV database interface
 */
export interface KVDatabase extends Storage {
    /**
     * Gets a value from a key
     *
     * @param key The key to lookup the value from
     * @param type The exact type of the value that is expected
     * @returns The value for the key, or `undefined` if not stored and no default value is provided
     * @examples
     *  ```ts
     *  getItem('age', Number)       // Type is a number
     *  getItem('name', String)      // Type is a string
     *  getItem('male', Boolean)     // Type is a boolean
     *  getItem('data', Uint8Array)  // Type is a Uint8Array
     *  getItem('greeting', 'Hello') // Type is a string and defaults to 'Hello' unless another greeting is stored.
     *  ```
     */
    getItem<T extends Widen<Primitive> = string, I = T>(key: string, type?: ItemAllowedType<T, I>): Promise<ItemReturnType<T, I> | undefined>;
    /**
     * Sets value for a key
     *
     * @param key The key to store the value
     * @param value The value to store
     */
    setItem(key: string, value: Widen<Primitive>): Promise<void>;
    /**
     * Removes a value for a key
     *
     * @param key The key to remove the value
     */
    removeItem(key: string): Promise<void>;
    /**
     * Clears all entries from the database
     */
    clear(): Promise<void>;
}
/**
 * A utility class to validate data types
 */
export declare const validator: {
    /** Checks if the value is a boolean */
    isBoolean: (v?: unknown) => v is boolean;
    /** Checks if the value is a string */
    isString: (v?: unknown) => v is string;
    /** Checks if the value is a number */
    isNumber: (v?: unknown) => v is number;
    /** Checks if the value is an ArrayBuffer */
    isArrayBuffer: (v?: unknown) => v is ArrayBuffer;
};
type ItemAllowedType<T extends Primitive = string, I = T> = T extends I ? Constructor<I> | ItemInstance<T> : undefined;
type ItemReturnType<T extends Primitive = string, I = T> = T extends I ? Widen<ItemInstance<T>> : undefined;
type ItemInstance<T> = T extends Constructor<infer U> ? U : T;
type Constructor<T = Primitive> = new (...args: unknown[]) => T;
type Primitive = string | number | boolean | ArrayBuffer;
type Widen<T> = T extends boolean ? boolean : T extends string ? string : T extends number ? number : T;
export {};
