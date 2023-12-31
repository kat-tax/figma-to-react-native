import styles from './bold.module.css';
import {createComponent} from '../../utilities/create-component';
import type {ReactNode} from 'react';

export type BoldProps = {
  children: ReactNode,
}

export const Bold = createComponent<HTMLSpanElement, BoldProps>(({children, ...rest}, ref) => {
  return (
    <strong {...rest} ref={ref} className={styles.bold}>
      {children}
    </strong>
  );
});
