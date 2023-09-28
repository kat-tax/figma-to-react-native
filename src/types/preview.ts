export type PreviewComponent = {
  name: string,
  props: string,
  index: string,
  code: string,
  story: string,
  preview: string,
  links: PreviewEditorLinks,
  assets: Array<[string, Uint8Array]> | null,
}

export type PreviewEditorLib = {
  path: string,
  content: string,
}

export type PreviewEditorLinks = Record<string, string>;
