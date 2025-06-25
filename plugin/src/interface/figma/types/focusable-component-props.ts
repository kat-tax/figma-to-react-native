import type {EventHandler} from './event-handler';

export interface FocusableComponentProps<Target extends EventTarget> {
  onKeyDown?: EventHandler.onKeyDown<Target>
  propagateEscapeKeyDown?: boolean
}
