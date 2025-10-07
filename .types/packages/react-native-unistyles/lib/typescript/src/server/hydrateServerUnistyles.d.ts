declare global {
    interface Window {
        __UNISTYLES_STATE__: ReturnType<typeof UnistylesWeb.registry.css.getState>;
    }
}
export declare const hydrateServerUnistyles: () => void;
//# sourceMappingURL=hydrateServerUnistyles.d.ts.map