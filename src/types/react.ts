/**
 * Simple representation of React component
 *
 * @example
 * const test: ReactComponent = {
 *   name: 'Button',
 *   stack: [],
 *   props: {
 *     title: 'string',
 *   },
 *   styles: {
 *     root: {
 *       backgroundColor: 'blue',
 *     },
 *   },
 *   logic: `
 *     useEffect(() => console.log('started), []);
 *   `,
 * }
 */
export interface ReactComponent {
  name: string,
  stack: ReactComponent[],
  props: Record<string, string>,
  styles: Record<string, Record<string, unknown>>,
  logic: string,
}
