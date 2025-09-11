export declare class Path {
    #private;
    /**
     * Creates a new instance.
     * @param steps The steps to use for the path.
     * @throws {TypeError} When steps is not iterable.
     */
    constructor(steps?: Iterable<string>);
    /**
     * Adds steps to the end of the path.
     * @param steps The steps to add to the path.
     */
    push(...steps: string[]): void;
    /**
     * Removes the last step from the path.
     * @returns The last step in the path.
     */
    pop(): string | undefined;
    /**
     * Returns an iterator for steps in the path.
     * @returns An iterator for the steps in the path.
     */
    steps(): IterableIterator<string>;
    /**
     * Returns an iterator for the steps in the path.
     * @returns An iterator for the steps in the path.
     */
    [Symbol.iterator](): IterableIterator<string>;
    /**
     * Retrieves the name (the last step) of the path.
     */
    get name(): string;
    /**
     * Sets the name (the last step) of the path.
     */
    set name(value: string);
    /**
     * Retrieves the size of the path.
     */
    get size(): number;
    /**
     * Returns the path as a string.
     * @returns The path as a string.
     */
    toString(): string;
    /**
     * Creates a new path based on the argument type. If the argument is a string,
     * it is assumed to be a file or directory path and is converted to a Path
     * instance. If the argument is a URL, it is assumed to be a file URL and is
     * converted to a Path instance. If the argument is a Path instance, it is
     * copied into a new Path instance. If the argument is an array, it is assumed
     * to be the steps of a path and is used to create a new Path instance.
     * @param pathish The value to convert to a Path instance.
     * @returns A new Path instance.
     * @throws {TypeError} When pathish is not a string, URL, Path, or Array.
     * @throws {TypeError} When pathish is a string and is empty.
     */
    static from(pathish: string | URL | Path | string[]): Path;
    /**
     * Creates a new Path instance from a string.
     * @param fileOrDirPath The file or directory path to convert.
     * @returns A new Path instance.
     * @deprecated Use Path.from() instead.
     */
    static fromString(fileOrDirPath: string): Path;
    /**
     * Creates a new Path instance from a URL.
     * @param url The URL to convert.
     * @returns A new Path instance.
     * @throws {TypeError} When url is not a URL instance.
     * @throws {TypeError} When url.pathname is empty.
     * @throws {TypeError} When url.protocol is not "file:".
     * @deprecated Use Path.from() instead.
     */
    static fromURL(url: URL): Path;
}
