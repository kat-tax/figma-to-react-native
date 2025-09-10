export declare const warn: (message: string) => void;
export declare const isWeb: boolean;
export declare const isIOS: boolean;
export declare const isAndroid: boolean;
export declare const isMobile: boolean;
export declare const isServer: boolean;
export declare const isDev: boolean;
export declare const isTest: boolean;
export declare const ScreenOrientation: {
    readonly Landscape: "landscape";
    readonly Portrait: "portrait";
};
export declare enum IOSContentSizeCategory {
    AccessibilityExtraExtraExtraLarge = "accessibilityExtraExtraExtraLarge",
    AccessibilityExtraExtraLarge = "accessibilityExtraExtraLarge",
    AccessibilityExtraLarge = "accessibilityExtraLarge",
    AccessibilityLarge = "accessibilityLarge",
    AccessibilityMedium = "accessibilityMedium",
    ExtraExtraExtraLarge = "xxxLarge",
    ExtraExtraLarge = "xxLarge",
    ExtraLarge = "xLarge",
    Large = "Large",
    Medium = "Medium",
    Small = "Small",
    ExtraSmall = "xSmall",
    Unspecified = "unspecified"
}
export declare enum AndroidContentSizeCategory {
    Small = "Small",
    Default = "Default",
    Large = "Large",
    ExtraLarge = "ExtraLarge",
    Huge = "Huge",
    ExtraHuge = "ExtraHuge",
    ExtraExtraHuge = "ExtraExtraHuge"
}
export declare enum UnistylesEventType {
    Theme = "theme",
    Layout = "layout",
    Plugin = "plugin"
}
export declare enum UnistylesError {
    RuntimeUnavailable = "Unistyles runtime is not available. Make sure you followed the installation instructions",
    ThemeNotFound = "You are trying to get a theme that is not registered with UnistylesRegistry",
    ThemeNotRegistered = "You are trying to set a theme that was not registered with UnistylesRegistry",
    ThemeNotSelected = "Your themes are registered, but you didn't select the initial theme",
    ThemesCannotBeEmpty = "You are trying to register empty themes object",
    BreakpointsCannotBeEmpty = "You are trying to register empty breakpoints object",
    BreakpointsMustStartFromZero = "You are trying to register breakpoints that don't start from 0",
    InvalidPluginName = "Plugin name can't start from reserved prefix __unistyles",
    DuplicatePluginName = "You are trying to register a plugin with a name that is already registered",
    CantRemoveInternalPlugin = "You are trying to remove an internal unistyles plugin"
}
//# sourceMappingURL=common.d.ts.map