export interface ParseData {
  code: ParsedComponent[],
  state: ParseState,
}

export interface ParseState {
  components: any,
  stylesheet: Record<string, Record<string, unknown>>,
  primitives: Set<string>,
  libraries: Set<string>,
}

export interface ParsedComponent {
  id: string,
  tag: string,
  name: string,
  slug: string,
  props?: any,
  styles?: Record<string, any>,
  children?: ParsedComponent[],
  value?: string,
  paths?: any[],
  fills?: any[],
  box?: any,
}

