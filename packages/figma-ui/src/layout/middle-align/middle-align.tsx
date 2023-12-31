import styles from './middle-align.module.css';
import {createComponent} from '../../utilities/create-component.js';
import type {ReactNode} from 'react';

export type MiddleAlignProps = {
  children: ReactNode,
}

export const MiddleAlign = createComponent<HTMLDivElement, MiddleAlignProps>(
  ({children, ...rest}, ref) => (
    <div {...rest} ref={ref} className={styles.middleAlign}>
      <div className={styles.children}>{children}</div>
    </div>
  )
);
