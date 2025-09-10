import { To } from 'react-router';
/**
 * Handles the click behavior for router `<Link>` components. This is useful if
 * you need to create custom `<Link>` components with the same click behavior we
 * use in our exported `<Link>`.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-link-click-handler
 */
export declare function useLinkClickHandler<E extends Element = HTMLAnchorElement>(to: To, { target, replace: replaceProp, state }?: {
    target?: React.HTMLAttributeAnchorTarget;
    replace?: boolean;
    state?: unknown;
}): (e: React.MouseEvent<E, MouseEvent>) => void;
