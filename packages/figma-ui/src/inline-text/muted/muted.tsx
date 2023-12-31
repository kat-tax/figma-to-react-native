import styles from './muted.module.css';
import {createComponent} from '../../utilities/create-component';
import type {ReactNode} from 'react';

export type MutedProps = {
  children: ReactNode,
}

export const Muted = createComponent<HTMLSpanElement, MutedProps>(
  ({children, ...rest}, ref) => (
    <span {...rest} ref={ref} className={styles.muted}>
      {children}
    </span>
  )
);
