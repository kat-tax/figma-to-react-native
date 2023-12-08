export interface Resolver {
  resolve(path: string):
    | Promise<string | Uint8Array>
    | Uint8Array
    | string,
}
