import styles from './container.module.css';
import {createClassName} from '../../lib/create-class-name';
import {createComponent} from '../../lib/create-component';
import type {ReactNode} from 'react';
import type {Space} from '../../types/space';

export type ContainerProps = {
  children: ReactNode,
  space: ContainerSpace,
}

export type ContainerSpace = Space;

export const Container = createComponent<HTMLDivElement, ContainerProps>(
  ({space, className, ...rest}, ref) => (
    <div
      {...rest}
      ref={ref}
      className={createClassName([className || null, styles[space]])}
    />
  )
);
