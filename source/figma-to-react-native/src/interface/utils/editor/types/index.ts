import {F2RN_EDITOR_NS} from 'config/env';

import env from './env.ts.tpl';
import styles from './styles.ts.tpl';
import reactNative from './react-native.ts.tpl';

export default {
  [`${F2RN_EDITOR_NS}env.d.ts`]: atob(env.toString()),
  [`${F2RN_EDITOR_NS}styles.d.ts`]: atob(styles.toString()),
  [`${F2RN_EDITOR_NS}react-native.d.ts`]: atob(reactNative.toString()),
}
