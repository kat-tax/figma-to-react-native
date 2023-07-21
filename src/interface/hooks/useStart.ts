import {on} from '@create-figma-plugin/utilities';
import {useEffect} from 'preact/hooks';

import type {StartHandler} from 'types/events';

export function useStart(identify?: (user: User) => void) {
  useEffect(() => on<StartHandler>('START_PLUGIN', (user) => {
    if (identify) identify(user);
  }), []);
  return;
}
