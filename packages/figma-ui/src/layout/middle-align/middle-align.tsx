import styles from './middle-align.module.css';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component.js';
import type {ReactNode} from 'react';

export type MiddleAlignProps = {
  children: ReactNode,
}

export const MiddleAlign = createComponent<HTMLDivElement, MiddleAlignProps>(
  ({children, className, ...rest}, ref) => (
    <div
      {...rest}
      ref={ref}
      className={createClassName([className || null ,styles.middleAlign])}>
      <div className={styles.children}>{children}</div>
    </div>
  )
);
