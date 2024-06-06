import parseAngle from './angle';
import parseLength from './length';
import parseLengthOrCoercePercentageToRuntime from './length-or-coerce-percentage-to-runtime';

import type {Transform} from 'lightningcss-wasm';
import type {TransformRecord, ParseDeclarationOptionsWithValueWarning} from '../types';

export default (transforms: Transform[], options: ParseDeclarationOptionsWithValueWarning) => {
  const records: TransformRecord[] = [];
  for (const transform of transforms) {
    switch (transform.type) {
      case 'perspective':
        records.push({
          [transform.type]: parseLength(transform.value, options) as number,
        });
        break;
      case 'translateX':
      case 'scaleX':
        records.push({
          [transform.type]: parseLengthOrCoercePercentageToRuntime(
            transform.value,
            'cw',
            options,
          ) as number,
        });
        break;
      case 'translateY':
      case 'scaleY':
        records.push({
          [transform.type]: parseLengthOrCoercePercentageToRuntime(
            transform.value,
            'ch',
            options,
          ) as number,
        });
        break;
      case 'translate':
        records.push({
          translateX: parseLength(transform.value[0], options) as number,
        });
        records.push({
          translateY: parseLength(transform.value[1], options) as number,
        });
        break;
      case 'scale':
        records.push({
          scaleX: parseLength(transform.value[0], options) as number,
        });
        records.push({
          scaleY: parseLength(transform.value[1], options) as number,
        });
        break;
      case 'skew':
        records.push({
          skewX: parseAngle(transform.value[0], options),
        });
        records.push({
          skewY: parseAngle(transform.value[1], options),
        });
        break;
      case 'rotate':
      case 'rotateX':
      case 'rotateY':
      case 'rotateZ':
      case 'skewX':
      case 'skewY':
        records.push({
          [transform.type]: parseAngle(transform.value, options),
        });
        break;
      case 'translateZ':
      case 'translate3d':
      case 'scaleZ':
      case 'scale3d':
      case 'rotate3d':
      case 'matrix':
      case 'matrix3d':
        break;
    }
  }

  return records;
}
