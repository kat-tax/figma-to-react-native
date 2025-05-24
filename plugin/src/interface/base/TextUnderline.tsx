import {Text} from 'figma-kit';

interface TextUnderlineProps {
  str: string,
  indices: Set<number>,
}

export function TextUnderline(props: TextUnderlineProps) {
  const parts = props.str.split('/');
  const group = parts.shift();
  const chars = parts.pop().split('');
  const nodes = chars.map((char, i) => {
    if (props.indices.has((group.length + 1) + i)) {
      return (
        <Text weight="strong" className="highlight">
          {char}
        </Text>
      );
    }
    return char;
  });

  return nodes;
};