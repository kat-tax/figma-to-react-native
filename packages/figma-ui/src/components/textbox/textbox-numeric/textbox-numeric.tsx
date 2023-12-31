import textboxStyles from '../textbox/textbox.module.css';
import textboxNumericStyles from './textbox-numeric.module.css';

import {createClassName} from '../../../utilities/create-class-name.js';
import {createComponent} from '../../../utilities/create-component.js';
import {RawTextboxNumeric} from './private/raw-textbox-numeric.js';

import type {ReactNode} from 'react';
import type {RawTextboxNumericProps} from './private/raw-textbox-numeric.js';

export type TextboxNumericProps = RawTextboxNumericProps & {
  icon?: ReactNode,
  variant?: TextboxNumericVariant,
}

export type TextboxNumericVariant = 'border' | 'underline';

export const TextboxNumeric = createComponent<HTMLInputElement, TextboxNumericProps>(({
  icon,
  variant, 
  ...rest
}, ref) => {
  if (typeof icon === 'string' && icon.length !== 1) {
    throw new Error(`String \`icon\` must be a single character: ${icon}`);
  }

  return (
    <div className={createClassName([
      textboxStyles.textbox,
      typeof variant === 'undefined'
        ? null
        : variant === 'border'
        ? textboxStyles.hasBorder
        : null,
      typeof icon === 'undefined'
        ? null
        : textboxStyles.hasIcon,
      rest.disabled
        ? textboxStyles.disabled
        : null
    ])}>
      <RawTextboxNumeric
        {...rest}
        ref={ref}
        className={createClassName([
          textboxStyles.input,
          textboxNumericStyles.input
        ])}
      />
      {typeof icon === 'undefined'
        ? null
        : <div className={textboxStyles.icon}>{icon}</div>
      }
      <div className={textboxStyles.border}/>
      {variant === 'underline'
        ? <div className={textboxStyles.underline}/>
        : null
      }
    </div>
  );
});
