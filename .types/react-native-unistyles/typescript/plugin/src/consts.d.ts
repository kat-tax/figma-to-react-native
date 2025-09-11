import type { RemapConfig } from '../index';
export declare const REACT_NATIVE_COMPONENT_NAMES: string[];
/**
 * auto replace RN imports to Unistyles imports under these paths
 * our implementation simply borrows 'ref' to register it in ShadowRegistry
 * so we won't affect anyone's implementation
 */
export declare const REPLACE_WITH_UNISTYLES_PATHS: string[];
/**
 * this is more powerful API as it allows to convert unmatched imports to Unistyles
 */
export declare const REPLACE_WITH_UNISTYLES_EXOTIC_PATHS: Array<RemapConfig>;
/**
 * this list will additionally detect React Native direct imports
 */
export declare const NATIVE_COMPONENTS_PATHS: Pick<RemapConfig, 'imports'>;
//# sourceMappingURL=consts.d.ts.map