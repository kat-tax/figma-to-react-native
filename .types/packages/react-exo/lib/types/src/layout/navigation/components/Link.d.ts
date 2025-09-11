import { LinkWeb } from './Link.interface';
/**
 * Navigates to a screen when clicked.
 *
 * @platform Native: renders a Pressable
 * @platform Web: renders an Anchor
 */
export declare const Link: import('react').ForwardRefExoticComponent<LinkWeb & import('react').RefAttributes<HTMLAnchorElement>>;
