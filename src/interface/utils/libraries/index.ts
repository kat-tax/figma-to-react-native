import {F2RN_EDITOR_NS} from 'config/env';
import reactNative from './react-native.ts.tpl';
import styles from './styles.ts.tpl';
import svg from './svg.ts.tpl';

export default {
  [`${F2RN_EDITOR_NS}react-native.d.ts`]: atob(reactNative.toString()),
  [`${F2RN_EDITOR_NS}styles.d.ts`]: atob(styles.toString()),
  [`${F2RN_EDITOR_NS}svg.d.ts`]: atob(svg.toString()),
}
