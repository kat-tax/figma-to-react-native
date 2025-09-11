import type { FilterFunction, TextStyle, ViewStyle } from 'react-native';
import type { UnionToIntersection } from '../../types';
import type { ToDeepUnistyles } from '../../types/stylesheet';
export type ShadowOffset = ToDeepUnistyles<{
    width: number;
    height: number;
}>;
export declare const TEXT_SHADOW_STYLES: readonly ["textShadowColor", "textShadowOffset", "textShadowRadius"];
export type TextShadow = Required<Pick<TextStyle, typeof TEXT_SHADOW_STYLES[number]>>;
export declare const BOX_SHADOW_STYLES: readonly ["shadowColor", "shadowRadius", "shadowOpacity", "shadowOffset"];
export type BoxShadow = Required<Pick<ViewStyle, typeof BOX_SHADOW_STYLES[number]>>;
export type AllShadow = TextShadow & BoxShadow;
export type AllShadowKeys = keyof AllShadow;
type FilterKeys = keyof UnionToIntersection<FilterFunction>;
export type Filters = {
    [K in FilterKeys]: UnionToIntersection<FilterFunction>[K];
};
export {};
//# sourceMappingURL=types.d.ts.map