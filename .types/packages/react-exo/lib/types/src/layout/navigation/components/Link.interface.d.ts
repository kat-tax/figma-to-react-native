import { To } from 'react-router';
import { PressableProps } from 'react-native';
export interface LinkBase {
    to: To;
    state?: unknown;
    replace?: boolean;
}
export interface LinkWeb extends LinkBase, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    /**
     * Reloads the browser when the link is clicked
     * @platform Web
     */
    reloadDocument?: boolean;
}
export interface LinkNative extends LinkBase, PressableProps {
}
export type LinkProps = LinkNative | LinkWeb;
