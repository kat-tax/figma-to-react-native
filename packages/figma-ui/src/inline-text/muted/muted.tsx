import styles from './muted.module.css';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component';
import type {ReactNode} from 'react';

export type MutedProps = {
  children: ReactNode,
}

export const Muted = createComponent<HTMLSpanElement, MutedProps>(
  ({children, className, ...rest}, ref) => (
    <span
      {...rest}
      ref={ref}
      className={createClassName([className || null, styles.muted])}>
      {children}
    </span>
  )
);
