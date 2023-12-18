export class Resolver {
  constructor(private readonly files: Map<string, string | Uint8Array>) {}
  public resolve(path: string) {
    if (!this.files.has(path))
      throw Error(`[bundler] ${path} not found`);
    return this.files.get(path)!;
  }
}
