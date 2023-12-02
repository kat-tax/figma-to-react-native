// @ts-ignore
import rn from './react-native.ts.tpl';
// @ts-ignore
import styles from './styles.ts.tpl';
// @ts-ignore
import svg from './svg.ts.tpl';

export default {
  'figma://model/react-native.d.ts': atob(rn.toString()),
  'figma://model/styles.d.ts': atob(styles.toString()),
  'figma://model/svg.d.ts': atob(svg.toString()),
}
