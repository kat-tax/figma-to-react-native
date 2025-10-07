import {getFillToken} from 'backend/parser/lib';

interface TextInputTokens {
  placeholderTextColor: string,
}

export function TextInput(root: ComponentNode) {
  const nodePlaceholder = root.findOne(c => c.name === 'placeholder' && c.type === 'TEXT') as TextNode;
  return textinput({
    placeholderTextColor: getFillToken(nodePlaceholder),
  }).slice(1);
}

export const textinput = (_: TextInputTokens) => `
import {TextInput as TextInputX} from 'react-native';
import {withUnistyles} from 'react-native-unistyles';

const TextInput = withUnistyles(TextInputX, (theme) => ({
  placeholderTextColor: ${_.placeholderTextColor},
})) as unknown as typeof TextInputX;

export {TextInput};
`;
