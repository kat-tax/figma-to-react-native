export type EditorComponent = {
  name: string,
  props: string,
  index: string,
  code: string,
  story: string,
  preview: string,
  links: EditorLinks,
  assets: Array<[string, Uint8Array]> | null,
}

export type EditorLibrary = {
  path: string,
  content: string,
}

export type EditorLinks = Record<string, string>;
