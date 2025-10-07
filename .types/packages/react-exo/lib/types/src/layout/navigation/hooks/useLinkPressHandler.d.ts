import { To } from 'react-router';
import { GestureResponderEvent } from 'react-native';
/**
 * Handles the press behavior for router `<Link>` components. This is useful if
 * you need to create custom `<Link>` components with the same press behavior we
 * use in our exported `<Link>`.
 */
export declare function useLinkPressHandler(to: To, { replace, state }?: {
    replace?: boolean;
    state?: unknown;
}): (e: GestureResponderEvent) => void;
