import styles from './code.module.css';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component';
import type {ReactNode} from 'react';

export type CodeProps = {
  children: ReactNode,
}

export const Code = createComponent<HTMLSpanElement, CodeProps>(({
  children,
  className,
  ...rest
}, ref) => (
  <code {...rest} ref={ref} className={createClassName([className || null, styles.code])}>
    {children}
  </code>
));
