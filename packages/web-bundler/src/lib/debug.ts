export function injectCodeInfo(contents: string, filePath: string): string {
  const lines = contents.split('\n');
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let newLine = line;
    let offset = 0;

    // Match JSX opening tags more carefully to avoid TypeScript types
    // Look for < followed by uppercase letter, but exclude generic types
    const jsxTagRegex = /<([A-Z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)*)([\s>\/])/g;
    let match: RegExpExecArray | null = null;

    // Reset regex for each line
    jsxTagRegex.lastIndex = 0;

    while ((match = jsxTagRegex.exec(line)) !== null) {
      const [fullMatch, tagName, followingChar] = match;
      const start = match.index + offset;

      // Skip if this looks like a TypeScript generic type
      // Check if there's a character before < that suggests it's a type
      const charBefore = start > 0 ? line[start - 1] : '';
      if (/[a-zA-Z0-9_]/.test(charBefore)) {
        // This is likely StyleProp<ViewStyle> or similar - skip it
        continue;
      }

      // Skip if the following pattern suggests it's a type annotation
      if (followingChar === ' ') {
        const afterMatch = line.slice(match.index + fullMatch.length);
        // Look ahead to see if this might be a generic type
        if (/^[A-Z][a-zA-Z0-9]*[\s]*[>,]/.test(afterMatch)) {
          continue;
        }
      }

      // Calculate column position (1-based) - position after the <
      const numCol = start + 2; // +1 for 1-based indexing, +1 to skip the <
      const numLine = lineIndex + 1;

      // Create data-inspector attributes
      const attrs = `dataSet={{source:"${numLine}:${numCol}@${relativePath}"}}`;

      // Reconstruct the tag with the dataSet attribute
      let replacement: string;
      if (followingChar === '>' || followingChar === '/') {
        // Tag closes immediately: <Tag> or <Tag/> becomes <Tag dataSet={{...}}> or <Tag dataSet={{...}}/>
        replacement = `<${tagName} ${attrs}${followingChar}`;
      } else {
        // Tag has whitespace/attributes: <Tag ... becomes <Tag dataSet={{...}} ...
        replacement = `<${tagName} ${attrs}${followingChar}`;
      }

      // Replace in the new line
      newLine = newLine.slice(0, start) + replacement + newLine.slice(start + fullMatch.length);

      // Update offset for subsequent matches in the same line
      offset += replacement.length - fullMatch.length;
    }

    lines[lineIndex] = newLine;
  }
  return lines.join('\n');
}
