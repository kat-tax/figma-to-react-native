/**
 * Types and interfaces for CSS Grid parsing
 */

import React from 'react';

export interface ColumnInfo {
  maxColumnRatioUnits: number;
  columnSizes: number[];
  hasExplicitSizes: boolean;
  hasFractionalUnits: boolean;
  totalFr: number;
}

export interface GridItemStyle {
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  gridColumnStart?: string | number;
  gridColumnEnd?: string | number;
  gridRowStart?: string | number;
  gridRowEnd?: string | number;
  justifySelf?: string;
  alignSelf?: string;
  placeSelf?: string;
  [key: string]: any;
}

export interface ColumnPattern {
  count: number;
  sizes: number[];
  fr: number;
}
