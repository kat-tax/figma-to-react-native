import React from 'react';
import type { Mappings } from './types';
type GenericComponentProps<P> = ComponentProps<P>;
export declare const withUnistyles: <TComponent, TMappings extends GenericComponentProps<TComponent>>(Component: TComponent, mappings?: Mappings<TMappings>) => React.ForwardRefExoticComponent<any>;
export {};
//# sourceMappingURL=withUnistyles.native.d.ts.map