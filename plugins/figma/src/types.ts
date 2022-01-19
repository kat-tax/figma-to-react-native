export interface CodeOptions {
  /**
   * Newline character.
   * @remarks Defaults to \n.
   */
  newLine: "\n" | "\r\n";
  /**
   * Number of spaces to indent when `useTabs` is false.
   * @remarks Defaults to 4.
   */
  indentNumberOfSpaces: number;
  /**
   * Whether to use tabs (true) or spaces (false).
   * @remarks Defaults to false.
   */
  useTabs: boolean;
  /**
   * Whether to use a single quote (true) or double quote (false).
   * @remarks Defaults to false.
   */
  useSingleQuote: boolean;
}
