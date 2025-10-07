import { UnistylesThemes, UnistylesBreakpoints, IOSContentSizeCategory, AndroidContentSizeCategory } from 'react-native-unistyles';
type AppThemeName = keyof UnistylesThemes;
type AppBreakpoint = keyof UnistylesBreakpoints;
type ColorScheme = 'light' | 'dark' | 'unspecified';
type SupportedStyleProps = typeof SUPPORTED_STYLE_PROPS[number];
declare const SUPPORTED_STYLE_PROPS: readonly ["style", "contentContainerStyle"];
declare enum WebContentSizeCategory {
    Unspecified = "web-unspecified"
}
interface UnistylesMiniRuntime {
    readonly colorScheme: ColorScheme;
    readonly contentSizeCategory: IOSContentSizeCategory | AndroidContentSizeCategory | WebContentSizeCategory;
    readonly themeName?: AppThemeName;
    readonly breakpoint?: AppBreakpoint;
}
export type UnistylesTheme = UnistylesThemes[keyof UnistylesThemes];
export type Mappings<T = {}> = (theme: UnistylesTheme, rt: UnistylesMiniRuntime) => Omit<Partial<T>, SupportedStyleProps> & {
    key?: string;
};
export {};
