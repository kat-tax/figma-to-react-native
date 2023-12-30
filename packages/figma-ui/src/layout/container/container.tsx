import {h} from 'preact';
import {createComponent} from '../../utilities/create-component';
import styles from './container.module.css';

import type {ComponentChildren} from 'preact';
import type {Space} from '../../types/space';

export type ContainerProps = {
  children: ComponentChildren,
  space: ContainerSpace,
}

export type ContainerSpace = Space;

export const Container = createComponent<HTMLDivElement, ContainerProps>(
  function ({space, ...rest}, ref) {
    return (
      <div {...rest} ref={ref} class={styles[space]}/>
    );
  }
)
