import { StatusBarStyle } from '../types';
import type { UnistylesStatusBar as UnistylesStatusBarSpec } from './UnistylesStatusBar.nitro';
export type StatusBarHiddenAnimation = 'none' | 'fade' | 'slide';
interface PrivateUnistylesStatusBar extends Omit<UnistylesStatusBarSpec, 'setBackgroundColor' | 'setHidden'> {
    setStyle(style: StatusBarStyle, animated?: boolean): void;
    setHidden(isHidden: boolean, animation?: StatusBarHiddenAnimation): void;
    _setHidden(isHidden: boolean, animation?: StatusBarHiddenAnimation): void;
}
export declare const attachStatusBarJSMethods: (hybridObject: UnistylesStatusBar) => void;
type PrivateMethods = '_setHidden' | 'dispose';
export type UnistylesStatusBar = Omit<PrivateUnistylesStatusBar, PrivateMethods>;
export {};
//# sourceMappingURL=index.d.ts.map