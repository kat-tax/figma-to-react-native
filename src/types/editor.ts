export type EditorComponent = {
  name: string,
  code: string,
  story: string,
  preview: string,
  links: EditorLinks,
}

export type EditorLibrary = {
  path: string,
  content: string,
}

export type EditorLinks = Record<string, string>;
