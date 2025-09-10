import type { UnistylesBreakpoints } from './global';
import type { ExtractVariantNames, ReactNativeStyleSheet, StyleSheetWithSuperPowers, UnistylesTheme } from './types';
type ParsedStylesheet<ST extends StyleSheetWithSuperPowers> = {
    theme: UnistylesTheme;
    breakpoint: keyof UnistylesBreakpoints;
    styles: ReactNativeStyleSheet<ST>;
};
/**
 * Hook that enables all the features of Unistyles
 * @param stylesheet - The stylesheet with superpowers to be used
 * @param variantsMap - The map of variants to be used
 * @returns - The theme, current breakpoint and RN compatible styles
 */
export declare const useStyles: <ST extends StyleSheetWithSuperPowers>(stylesheet?: ST, variantsMap?: ExtractVariantNames<typeof stylesheet>) => ParsedStylesheet<ST>;
export {};
//# sourceMappingURL=useStyles.d.ts.map