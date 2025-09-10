export declare const useUnistyles: () => {
    plugins: string[];
    theme: never;
    layout: {
        screen: import("../types").ScreenSize;
        statusBar: import("../types").ScreenDimensions;
        navigationBar: import("../types").ScreenDimensions;
        insets: import("../types").ScreenInsets;
        breakpoint: keyof import("..").UnistylesBreakpoints;
        orientation: "landscape" | "portrait";
    };
};
//# sourceMappingURL=useUnistyles.d.ts.map