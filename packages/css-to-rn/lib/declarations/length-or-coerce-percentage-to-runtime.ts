import parseLength from './length';

import type {Length, DimensionPercentageFor_LengthValue, NumberOrPercentage} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types'

export default (
  value: Length | DimensionPercentageFor_LengthValue | NumberOrPercentage,
  runtimeName: string,
  options: ParseDeclarationOptionsWithValueWarning,
) => {
  if (value.type === 'percentage') {
    return {
      type: 'runtime',
      name: runtimeName,
      arguments: [value.value],
    };
  } else {
    return parseLength(value, options);
  }
}
