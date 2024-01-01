import styles from './divider.module.css';
import {createComponent} from '../../utilities/create-component.js';

export const Divider = createComponent<HTMLHRElement, Record<string, never>>(
  (rest, ref) => (
    <hr {...rest} ref={ref} className={styles.divider}/>
  )
);
