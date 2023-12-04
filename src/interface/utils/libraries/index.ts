// @ts-ignore
import rn from './react-native.ts.tpl';
// @ts-ignore
import styles from './styles.ts.tpl';
// @ts-ignore
import svg from './svg.ts.tpl';

export default {
  'figma://preview/react-native.d.ts': atob(rn.toString()),
  'figma://preview/styles.d.ts': atob(styles.toString()),
  'figma://preview/svg.d.ts': atob(svg.toString()),
}
