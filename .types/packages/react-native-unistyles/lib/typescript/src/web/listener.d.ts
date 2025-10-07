import { UnistyleDependency } from '../specs/NativePlatform';
import type { UnistylesServices } from './types';
type Listener = (dependency: UnistyleDependency) => void;
export declare class UnistylesListener {
    private services;
    private isInitialized;
    private listeners;
    private stylesheetListeners;
    constructor(services: UnistylesServices);
    emitChange: (dependency: UnistyleDependency) => void;
    initListeners: () => void;
    addListeners: (dependencies: Array<UnistyleDependency>, listener: Listener) => () => void;
    addStylesheetListeners: (dependencies: Array<UnistyleDependency>, listener: Listener) => () => void;
}
export {};
//# sourceMappingURL=listener.d.ts.map