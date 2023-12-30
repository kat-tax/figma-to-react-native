import {h, toChildArray} from 'preact';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component';
import styles from './columns.module.css';

import type {ComponentChild} from 'preact';
import type {Space} from '../../types/space';

export type ColumnsProps = {
  children: ComponentChild
  space?: ColumnsSpace
}

export type ColumnsSpace = Space;

export const Columns = createComponent<HTMLDivElement, ColumnsProps>(({children, space, ...rest}, ref) => {
  return (
    <div
      {...rest}
      ref={ref}
      class={createClassName([
        styles.columns,
        typeof space === 'undefined' ? null : styles[space]
      ])}
    >
      {toChildArray(children).map(function (
        element: ComponentChild,
        index: number
      ) {
        return (
          <div key={index} class={styles.child}>
            {element}
          </div>
        )
      })}
    </div>
  )
});
