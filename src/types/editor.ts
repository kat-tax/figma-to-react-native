export type EditorComponent = {
  name: string,
  props: ComponentPropertyDefinitions | null,
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
