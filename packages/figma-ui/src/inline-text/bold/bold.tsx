import styles from './bold.module.css';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component';
import type {ReactNode} from 'react';

export type BoldProps = {
  children: ReactNode,
}

export const Bold = createComponent<HTMLSpanElement, BoldProps>(({
  children,
  className,
  ...rest
}, ref) => (
  <strong
    {...rest}
    ref={ref}
    className={createClassName([className || null, styles.bold])}>
    {children}
  </strong>
));
