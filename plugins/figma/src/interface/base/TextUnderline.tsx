import {Fragment} from 'react';
import {Bold} from 'figma-ui';

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
        <Bold className="highlight">
          {char}
        </Bold>
      );
    }
    return char;
  });

  return nodes;
};