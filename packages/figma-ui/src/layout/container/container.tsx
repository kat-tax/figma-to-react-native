import styles from './container.module.css';
import {createComponent} from '../../utilities/create-component';
import type {ReactNode} from 'react';
import type {Space} from '../../types/space';

export type ContainerProps = {
  children: ReactNode,
  space: ContainerSpace,
}

export type ContainerSpace = Space;

export const Container = createComponent<HTMLDivElement, ContainerProps>(
  ({space, ...rest}, ref) => (
    <div {...rest} ref={ref} className={styles[space]}/>
  )
);
