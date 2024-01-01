import styles from './textbox.module.css';
import {createClassName} from '../../../utilities/create-class-name.js';
import {createComponent} from '../../../utilities/create-component.js';
import {RawTextbox, RawTextboxProps} from './private/raw-textbox.js';
import type {ReactNode} from 'react';

export type TextboxProps = RawTextboxProps & {
  icon?: ReactNode,
  variant?: TextboxVariant,
}

export type TextboxVariant = 'border' | 'underline';

export const Textbox = createComponent<HTMLInputElement, TextboxProps>(({
  icon,
  variant,
  ...rest
}, ref) => {
  if (typeof icon === 'string' && icon.length !== 1) {
    throw new Error(`String \`icon\` must be a single character: ${icon}`)
  }

  return (
    <div
      className={createClassName([
        styles.textbox,
        variant === 'border' ? styles.hasBorder : null,
        typeof icon === 'undefined' ? null : styles.hasIcon,
        rest.disabled ? styles.disabled : null
      ])}>
      <RawTextbox
        {...rest}
        ref={ref}
        className={styles.input}
      />
      {typeof icon === 'undefined'
        ? null
        : <div className={styles.icon}>{icon}</div>
      }
      <div className={styles.border}/>
      {variant === 'underline'
        ? <div className={styles.underline}/>
        : null
      }
    </div>
  );
});
