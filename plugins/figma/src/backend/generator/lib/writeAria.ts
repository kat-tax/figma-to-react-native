import CodeBlockWriter from 'code-block-writer';

export function writeAria(
  _writer: CodeBlockWriter,
) {
  /* TODO: additional accessibility for custom pressables
    if (isPressable) {
      writer.writeLine(`const ref = useRef(null);`);
      writer.writeLine(`const {buttonProps} = useButton(props);`);
      writer.writeLine(`const {hoverProps} = useHover({}, ref);`);
      writer.writeLine(`const {focusProps} = useFocusRing();`);
      writer.writeLine(`const ariaProps = {...buttonProps, ...hoverProps, ...focusProps};`);
      writer.blankLine();
    }
  */
}
