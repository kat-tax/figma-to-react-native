import {F2RN_EDITOR_NS} from 'config/env';

import env from './env.ts.tpl';
import unistyles from './unistyles.ts.tpl';
import reactNative from './react-native.ts.tpl';
import reactNativeExo from './react-native-exo.ts.tpl';

export default {
  [`${F2RN_EDITOR_NS}env.d.ts`]: atob(env.toString()),
  [`${F2RN_EDITOR_NS}unistyles.ts`]: atob(unistyles.toString()),
  [`${F2RN_EDITOR_NS}react-native.d.ts`]: atob(reactNative.toString()),
  [`${F2RN_EDITOR_NS}react-native-exo.d.ts`]: atob(reactNativeExo.toString()),
}
