import { UnistylesListener } from './listener';
import { UnistylesRegistry } from './registry';
import { UnistylesRuntime } from './runtime';
import { UnistylesShadowRegistry } from './shadowRegistry';
import { UnistylesState } from './state';
declare class UnistylesServices {
    runtime: UnistylesRuntime;
    registry: UnistylesRegistry;
    shadowRegistry: UnistylesShadowRegistry;
    state: UnistylesState;
    listener: UnistylesListener;
    private services;
    constructor();
}
declare global {
    var __unistyles__: UnistylesServices;
}
export declare const services: UnistylesServices;
export {};
//# sourceMappingURL=services.d.ts.map