import type { Optional, RNStyle } from '../types';
export declare const proxifyFunction: (key: string, fn: Function, variant?: Record<string, Optional<string>>) => Function;
export declare const isPlatformColor: <T extends {}>(value: T) => boolean;
export declare const parseStyle: <T extends RNStyle>(style: T, variant?: Record<string, Optional<string>>, parseMediaQueries?: boolean) => T;
//# sourceMappingURL=styles.d.ts.map