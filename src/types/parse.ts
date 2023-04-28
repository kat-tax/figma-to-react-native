export interface ParseData {
  code: ParsedComponent[],
  state: ParseState,
}

export interface ParseState {
  includes: any,
  components: any,
  stylesheet: any,
  primitives: Set<string>,
  libraries: Set<string>,
}

export interface ParsedComponent {
  id: string,
  tag: string,
  name: string,
  slug: string,
  node: any,
  swap?: string,
  props?: any,
  styles?: Record<string, any>,
  children?: ParsedComponent[],
  value?: string,
  paths?: any[],
  fills?: any[],
  box?: any,
}

