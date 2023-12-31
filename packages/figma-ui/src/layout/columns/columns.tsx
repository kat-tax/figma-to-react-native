import styles from './columns.module.css';

import {toChildArray} from 'preact';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component';

import type {ReactNode} from 'react';
import type {Space} from '../../types/space';

export type ColumnsProps = {
  children: ReactNode,
  space?: ColumnsSpace,
}

export type ColumnsSpace = Space;

export const Columns = createComponent<HTMLDivElement, ColumnsProps>(({children, space, ...rest}, ref) => {
  const classes = [
    styles.columns,
    typeof space === 'undefined' ? null : styles[space],
  ];

  return (
    <div {...rest} ref={ref} className={createClassName(classes)}>
      {toChildArray(children).map((element: ReactNode, index: number) => (
        <div key={index} className={styles.child}>
          {element}
        </div>
      ))}
    </div>
  );
});
