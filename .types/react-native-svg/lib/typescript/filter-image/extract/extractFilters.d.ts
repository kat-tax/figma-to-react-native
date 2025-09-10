import React from 'react';
import { FilterElement, Filters } from '../types';
export declare const extractFiltersCss: (rawFilters?: Filters | string) => Filters;
export declare const mapFilterToComponent: ({ name, ...props }: FilterElement, index: number) => React.CElement<import("../..").FeColorMatrixProps & import("../..").FilterPrimitiveCommonProps, import("../..").FeColorMatrix> | null;
//# sourceMappingURL=extractFilters.d.ts.map