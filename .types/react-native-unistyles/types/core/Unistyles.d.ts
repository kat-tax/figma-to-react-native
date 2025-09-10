import { UnistylesRuntime } from './UnistylesRuntime';
import { UnistyleRegistry } from './UnistyleRegistry';
declare class Unistyles {
    private _runtime;
    private _registry;
    private _bridge;
    constructor();
    get registry(): UnistyleRegistry;
    get runtime(): UnistylesRuntime;
}
export declare const unistyles: Unistyles;
export {};
//# sourceMappingURL=Unistyles.d.ts.map