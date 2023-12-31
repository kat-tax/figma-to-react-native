import styles from './text.module.css';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import type {ReactNode} from 'react';

export type TextProps = {
  children: ReactNode,
  numeric?: boolean,
  align?: TextAlignment,
}

export type TextAlignment = 'left' | 'center' | 'right';

export const Text = createComponent<HTMLDivElement, TextProps>(({
  children,
  align = 'left',
  numeric = false,
  ...rest
}) => (
  <div
    {...rest}
    className={createClassName([
      styles.text,
      styles[align],
      numeric ? styles.numeric : null
    ])}>
    {children}
  </div>
));
