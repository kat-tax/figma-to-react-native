import { type DependencyList } from 'react';
type SharedContextConfig = {
    useContext: boolean;
    deps: DependencyList;
};
export declare const useSharedContext: (config: SharedContextConfig) => {
    plugins: string[];
    theme: never;
    layout: {
        breakpoint: keyof import("..").UnistylesBreakpoints;
        orientation: "landscape" | "portrait";
        screen: {
            width: number;
            height: number;
        };
        statusBar: {
            width: number;
            height: number;
        };
        navigationBar: {
            width: number;
            height: number;
        };
        insets: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
    };
};
export {};
//# sourceMappingURL=useSharedContext.d.ts.map