import type { UnistylesValues } from '../types';
import type { UnistylesListener } from './listener';
import type { UnistylesRegistry } from './registry';
import type { UnistylesRuntime } from './runtime';
import type { UnistylesShadowRegistry } from './shadowRegistry';
import type { UnistylesState } from './state';
export type UnistylesServices = {
    runtime: UnistylesRuntime;
    registry: UnistylesRegistry;
    shadowRegistry: UnistylesShadowRegistry;
    state: UnistylesState;
    listener: UnistylesListener;
};
export declare const UNI_GENERATED_KEYS: readonly ["$$css", "hash", "injectedClassName"];
export type UniGeneratedKey = typeof UNI_GENERATED_KEYS[number];
export type UniGeneratedStyle = Record<UniGeneratedKey, string> & {
    parsedStyles?: UnistylesValues;
};
//# sourceMappingURL=types.d.ts.map