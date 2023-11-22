// @ts-nocheck
import rn from './react-native.ts.tpl';
import styles from './styles.ts.tpl';
import svg from './svg.ts.tpl';

export default {
  'figma://model/react-native.d.ts': atob(rn.toString()),
  'figma://model/styles.d.ts': atob(styles.toString()),
  'figma://model/svg.d.ts': atob(svg.toString()),
}
