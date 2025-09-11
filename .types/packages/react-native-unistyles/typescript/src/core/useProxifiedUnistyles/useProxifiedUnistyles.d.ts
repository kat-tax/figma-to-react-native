import { type UnistylesMiniRuntime } from '../../specs';
import { UnistyleDependency } from '../../specs/NativePlatform';
import type { UnistylesTheme } from '../../types';
export declare const useProxifiedUnistyles: (forcedTheme?: UnistylesTheme) => {
    proxifiedTheme: never;
    proxifiedRuntime: UnistylesMiniRuntime;
    addDependencies: (newDependencies: Array<UnistyleDependency>) => void;
};
//# sourceMappingURL=useProxifiedUnistyles.d.ts.map