import styles from './code.module.css';
import {createComponent} from '../../utilities/create-component';
import type {ReactNode} from 'react';

export type CodeProps = {
  children: ReactNode,
}

export const Code = createComponent<HTMLSpanElement, CodeProps>(({children, ...rest}, ref) => {
  return (
    <code {...rest} ref={ref} className={styles.code}>
      {children}
    </code>
  );
});
