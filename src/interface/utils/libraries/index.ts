import reactNative from './react-native.ts.tpl';
import styles from './styles.ts.tpl';
import svg from './svg.ts.tpl';

export default {
  'figma://preview/react-native.d.ts': atob(reactNative.toString()),
  'figma://preview/styles.d.ts': atob(styles.toString()),
  'figma://preview/svg.d.ts': atob(svg.toString()),
}
