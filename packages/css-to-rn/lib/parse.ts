import * as $ from './declarations/_index';
import {isValid, validPropertiesLoose} from './val';

import type {Declaration, TokenOrValue} from 'lightningcss-wasm';
import type {ParseDeclarationOptions} from './types';

/**
 * Helper function to add default FlexGrid properties that cannot be derived from CSS
 * These properties are required by FlexGrid but have no CSS equivalent
 */
function addDefaultFlexGridProperties(addStyleProp: (property: string, value: any) => void) {
  // Set default itemSizeUnit if not already set
  // This is required by FlexGrid but has no CSS equivalent
  addStyleProp('_flexGridDefaults', {
    itemSizeUnit: 50, // Default base unit size
    data: [], // Empty data array - must be populated by the consumer
    renderItem: null, // Must be provided by the consumer
    virtualization: true,
    autoAdjustItemWidth: true,
    virtualizedBufferFactor: 2,
    scrollEventInterval: 200,
    showScrollIndicator: true,
    onHorizontalEndReachedThreshold: 0.5,
    onVerticalEndReachedThreshold: 0.5
  });
}

export function parseDeclaration(declaration: Declaration, options: ParseDeclarationOptions) {
  const {addStyleProp, addWarning, handleStyleShorthand} = options;
  const {property, value} = declaration;

  if (property === 'unparsed') {
    return parseUnparsedProperty(declaration, options);
  } else if (property === 'custom') {
    return parseCustomProperty(declaration, options);
  }

  if (!isValid(declaration)) {
    return addWarning({type: 'IncompatibleNativeProperty', property});
  }

  const opts = {
    ...options,
    addValueWarning: (v: any) => addWarning({type: 'IncompatibleNativeValue', property, value: v}),
    addFunctionValueWarning: (v: any) => addWarning({type: 'IncompatibleNativeFunctionValue', property, value: v}),
  };

  switch (property) {
    case 'background-color':
      return addStyleProp(property, $.color(value, opts));
    case 'opacity':
      return addStyleProp(property, value);
    case 'color':
      return addStyleProp(property, $.color(value, opts));
    case 'display':
      return addStyleProp(property, $.display(value, opts));
    case 'width':
      return addStyleProp(property, $.size(value, opts));
    case 'height':
      return addStyleProp(property, $.size(value, opts));
    case 'min-width':
      return addStyleProp(property, $.size(value, opts));
    case 'min-height':
      return addStyleProp(property, $.size(value, opts));
    case 'max-width':
      return addStyleProp(property, $.size(value, opts));
    case 'max-height':
      return addStyleProp(property, $.size(value, opts));
    case 'block-size':
      return addStyleProp('width', $.size(value, opts));
    case 'inline-size':
      return addStyleProp('height', $.size(value, opts));
    case 'min-block-size':
      return addStyleProp('min-width', $.size(value, opts));
    case 'min-inline-size':
      return addStyleProp('min-height', $.size(value, opts));
    case 'max-block-size':
      return addStyleProp('max-width', $.size(value, opts));
    case 'max-inline-size':
      return addStyleProp('max-height', $.size(value, opts));
    case 'overflow':
      return addStyleProp(property, $.overflow(value.x, opts));
    case 'position':
      const pos: any = (declaration as any).value.type;
      if (pos === 'absolute' || pos === 'relative') {
        return addStyleProp(property, pos);
      } else {
        opts.addValueWarning(pos);
      }
      return;
    case 'top':
      return addStyleProp(property, $.size(value, opts));
    case 'bottom':
      return addStyleProp(property, $.size(value, opts));
    case 'left':
      return addStyleProp(property, $.size(value, opts));
    case 'right':
      return addStyleProp(property, $.size(value, opts));
    case 'inset-block-start':
      return addStyleProp(property, $.lengthPercentageOrAuto(value, opts));
    case 'inset-block-end':
      return addStyleProp(property, $.lengthPercentageOrAuto(value, opts));
    case 'inset-inline-start':
      return addStyleProp( property, $.lengthPercentageOrAuto(value, opts));
    case 'inset-inline-end':
      return addStyleProp(property, $.lengthPercentageOrAuto(value, opts));
    case 'inset-block':
      addStyleProp('inset-block-start', $.lengthPercentageOrAuto(value.blockStart, opts));
      addStyleProp('inset-block-end', $.lengthPercentageOrAuto(value.blockEnd, opts));
      return;
    case 'inset-inline':
      addStyleProp('inset-inline-start', $.lengthPercentageOrAuto(value.inlineStart, opts));
      addStyleProp('inset-inline-end', $.lengthPercentageOrAuto(value.inlineEnd, opts));
      return;
    case 'inset':
      handleStyleShorthand('inset', {
        top: $.lengthPercentageOrAuto(value.top, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'top', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'top', value});
          },
        }),
        bottom: $.lengthPercentageOrAuto(value.bottom, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'bottom', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'bottom', value});
          },
        }),
        left: $.lengthPercentageOrAuto(value.left, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'left', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'left', value});
          },
        }),
        right: $.lengthPercentageOrAuto(value.right, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'right', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'right', value});
          },
        }),
      });
      return;
    case 'border-top-color':
      return addStyleProp(property, $.color(value, opts));
    case 'border-bottom-color':
      return addStyleProp(property, $.color(value, opts));
    case 'border-left-color':
      return addStyleProp(property, $.color(value, opts));
    case 'border-right-color':
      return addStyleProp(property, $.color(value, opts));
    case 'border-block-start-color':
      return addStyleProp('border-top-color', $.color(value, opts));
    case 'border-block-end-color':
      return addStyleProp('border-bottom-color', $.color(value, opts));
    case 'border-inline-start-color':
      return addStyleProp('border-left-color', $.color(value, opts));
    case 'border-inline-end-color':
      return addStyleProp('border-right-color', $.color(value, opts));
    case 'border-top-width':
      return addStyleProp(property, $.borderSideWidth(value, opts));
    case 'border-bottom-width':
      return addStyleProp(property, $.borderSideWidth(value, opts));
    case 'border-left-width':
      return addStyleProp(property, $.borderSideWidth(value, opts));
    case 'border-right-width':
      return addStyleProp(property, $.borderSideWidth(value, opts));
    case 'border-block-start-width':
      return addStyleProp('border-top-width', $.borderSideWidth(value, opts));
    case 'border-block-end-width':
      return addStyleProp('border-bottom-width', $.borderSideWidth(value, opts));
    case 'border-inline-start-width':
      return addStyleProp('border-left-width', $.borderSideWidth(value, opts));
    case 'border-inline-end-width':
      return addStyleProp('border-right-width', $.borderSideWidth(value, opts));
    case 'border-top-left-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-top-right-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-bottom-left-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-bottom-right-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-start-start-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-start-end-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-end-start-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-end-end-radius':
      return addStyleProp(property, $.length(value[0], opts));
    case 'border-radius':
      addStyleProp('border-bottom-left-radius', $.length(value.bottomLeft[0], opts));
      addStyleProp('border-bottom-right-radius', $.length(value.bottomRight[0], opts));
      addStyleProp('border-top-left-radius', $.length(value.topLeft[0], opts));
      addStyleProp('border-top-right-radius', $.length(value.topRight[0], opts));
      return;
    case 'border-color':
      handleStyleShorthand('border-color', {
        'border-top-color': $.color(value.top, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'border-top-color', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'border-top-color', value});
          },
        }),
        'border-bottom-color': $.color(value.bottom, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'border-bottom-color', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'border-bottom-color', value});
          },
        }),
        'border-left-color': $.color(value.left, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'border-left-color', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'border-left-color', value});
          },
        }),
        'border-right-color': $.color(value.right, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'border-right-color', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'border-right-color', value});
          },
        }),
      });
      return;
    case 'border-style':
      return addStyleProp(property, $.borderStyle(value, opts));
    case 'border-width':
      addStyleProp('border-top-width', $.borderSideWidth(value.top, opts));
      addStyleProp('border-bottom-width', $.borderSideWidth(value.bottom, opts));
      addStyleProp('border-left-width', $.borderSideWidth(value.left, opts));
      addStyleProp('border-right-width', $.borderSideWidth(value.right, opts));
      return;
    case 'border-block-color':
      addStyleProp('border-top-color', $.color(value.start, opts));
      addStyleProp('border-bottom-color', $.color(value.end, opts));
      return;
    case 'border-block-width':
      addStyleProp('border-top-width', $.borderSideWidth(value.start, opts));
      addStyleProp('border-bottom-width', $.borderSideWidth(value.end, opts));
      return;
    case 'border-inline-color':
      addStyleProp('border-left-color', $.color(value.start, opts));
      addStyleProp('border-right-color', $.color(value.end, opts));
      return;
    case 'border-inline-width':
      addStyleProp('border-left-width', $.borderSideWidth(value.start, opts));
      addStyleProp('border-right-width', $.borderSideWidth(value.end, opts));
      return;
    case 'border':
      addStyleProp('border-width', $.borderSideWidth(value.width, opts));
      addStyleProp('border-style', $.borderStyle(value.style, opts));
      addStyleProp('border-color', $.color(value.color, opts));
      return;
    case 'border-top':
      addStyleProp(property + '-color', $.color(value.color, opts));
      addStyleProp(property + '-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-bottom':
      addStyleProp(property + '-color', $.color(value.color, opts));
      addStyleProp(property + '-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-left':
      addStyleProp(property + '-color', $.color(value.color, opts));
      addStyleProp(property + '-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-right':
      addStyleProp(property + '-color', $.color(value.color, opts));
      addStyleProp(property + '-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-block':
      addStyleProp('border-top-color', $.color(value.color, opts));
      addStyleProp('border-bottom-color', $.color(value.color, opts));
      addStyleProp('border-top-width', $.borderSideWidth(value.width, opts));
      addStyleProp('border-bottom-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-block-start':
      addStyleProp('border-top-color', $.color(value.color, opts));
      addStyleProp('border-top-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-block-end':
      addStyleProp('border-bottom-color', $.color(value.color, opts));
      addStyleProp('border-bottom-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-inline':
      addStyleProp('border-left-color', $.color(value.color, opts));
      addStyleProp('border-right-color', $.color(value.color, opts));
      addStyleProp('border-left-width', $.borderSideWidth(value.width, opts));
      addStyleProp('border-right-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-inline-start':
      addStyleProp('border-left-color', $.color(value.color, opts));
      addStyleProp('border-left-width', $.borderSideWidth(value.width, opts));
      return;
    case 'border-inline-end':
      addStyleProp('border-right-color', $.color(value.color, opts));
      addStyleProp('border-right-width', $.borderSideWidth(value.width, opts));
      return;
    case 'flex-direction':
      return addStyleProp(property, value);
    case 'flex-wrap':
      return addStyleProp(property, value);
    case 'flex-flow':
      addStyleProp('flexWrap', value.wrap);
      addStyleProp('flexDirection', value.direction);
      return;
    case 'flex-grow':
      return addStyleProp(property, value);
    case 'flex-shrink':
      return addStyleProp(property, value);
    case 'flex-basis':
      return addStyleProp(property, $.lengthPercentageOrAuto(value, opts));
    case 'flex':
      addStyleProp('flex-grow', value.grow);
      addStyleProp('flex-shrink', value.shrink);
      addStyleProp('flex-basis', $.lengthPercentageOrAuto(value.basis, opts));
      return;
    case 'align-content':
      return addStyleProp(property, $.alignContent(value, opts));
    case 'justify-content':
      return addStyleProp( property, $.justifyContent(value, opts));
    case 'align-self':
      return addStyleProp(property, $.alignSelf(value, opts));
    case 'align-items':
      return addStyleProp(property, $.alignItems(value, opts));
    case 'row-gap':
      return addStyleProp('row-gap', $.gap(value, opts));
    case 'column-gap':
      return addStyleProp('column-gap', $.gap(value, opts));
    case 'gap':
      addStyleProp('row-gap', $.gap(value.row, opts));
      addStyleProp('column-gap', $.gap(value.column, opts));
      return;
    case 'margin-top':
      return addStyleProp(property, $.size(value, opts));
    case 'margin-bottom':
      return addStyleProp(property, $.size(value, opts));
    case 'margin-left':
      return addStyleProp(property, $.size(value, opts));
    case 'margin-right':
      return addStyleProp(property, $.size(value, opts));
    case 'margin-block-start':
      return addStyleProp('margin-start', $.lengthPercentageOrAuto(value, opts));
    case 'margin-block-end':
      return addStyleProp('margin-end', $.lengthPercentageOrAuto(value, opts));
    case 'margin-inline-start':
      return addStyleProp('margin-start', $.lengthPercentageOrAuto(value, opts));
    case 'margin-inline-end':
      return addStyleProp('margin-end', $.lengthPercentageOrAuto(value, opts));
    case 'margin':
      addStyleProp('margin-top', $.size(value.top, opts));
      addStyleProp('margin-bottom', $.size(value.bottom, opts));
      addStyleProp('margin-left', $.size(value.left, opts));
      addStyleProp('margin-right', $.size(value.right, opts));
      return;
    case 'margin-block':
      addStyleProp('margin-start', $.lengthPercentageOrAuto(value.blockStart, opts));
      addStyleProp('margin-end', $.lengthPercentageOrAuto(value.blockEnd, opts));
      return;
    case 'margin-inline':
      addStyleProp('margin-start', $.lengthPercentageOrAuto(value.inlineStart, opts));
      addStyleProp('margin-end', $.lengthPercentageOrAuto(value.inlineEnd, opts));
      return;
    case 'padding':
      addStyleProp('padding-top', $.size(value.top, opts));
      addStyleProp('padding-left', $.size(value.left, opts));
      addStyleProp('padding-bottom', $.size(value.bottom, opts));
      addStyleProp('padding-right', $.size(value.right, opts));
      return;
    case 'padding-top':
      return addStyleProp(property, $.size(value, opts));
    case 'padding-bottom':
      return addStyleProp(property, $.size(value, opts));
    case 'padding-left':
      return addStyleProp(property, $.size(value, opts));
    case 'padding-right':
      return addStyleProp(property, $.size(value, opts));
    case 'padding-block-start':
      return addStyleProp('padding-start', $.lengthPercentageOrAuto(value, opts));
    case 'padding-block-end':
      return addStyleProp('padding-end', $.lengthPercentageOrAuto(value, opts));
    case 'padding-inline-start':
      return addStyleProp('padding-start', $.lengthPercentageOrAuto(value, opts));
    case 'padding-inline-end':
      return addStyleProp('padding-end', $.lengthPercentageOrAuto(value, opts));
    case 'padding-block':
      addStyleProp('padding-start', $.lengthPercentageOrAuto(value.blockStart, opts));
      addStyleProp('padding-end', $.lengthPercentageOrAuto(value.blockEnd, opts));
      return;
    case 'padding-inline':
      addStyleProp('padding-start', $.lengthPercentageOrAuto(value.inlineStart, opts));
      addStyleProp('padding-end', $.lengthPercentageOrAuto(value.inlineEnd, opts));
      return;
    case 'font-weight':
      return addStyleProp(property, $.fontWeight(value, opts));
    case 'font-size':
      return addStyleProp(property, $.fontSize(value, opts));
    case 'font-family':
      return addStyleProp(property, $.fontFamily(value));
    case 'font-style':
      return addStyleProp(property, $.fontStyle(value, opts));
    case 'font-variant-caps':
      return addStyleProp(property, $.fontVariantCaps(value, opts));
    case 'line-height':
      return addStyleProp(property, $.lineHeight(value, opts));
    case 'font':
      addStyleProp(property + '-family', $.fontFamily(value.family));
      addStyleProp('line-height', $.lineHeight(value.lineHeight, opts));
      addStyleProp(property + '-size', $.fontSize(value.size, opts));
      addStyleProp(property + '-style', $.fontStyle(value.style, opts));
      addStyleProp(property + '-variant', $.fontVariantCaps(value.variantCaps, opts));
      addStyleProp(property + '-weight', $.fontWeight(value.weight, opts));
      return;
    case 'vertical-align':
      return addStyleProp(property, $.verticalAlign(value, opts));
    case 'text-transform':
      return addStyleProp(property, value.case);
    case 'letter-spacing':
      if (value.type !== 'normal') {
        return addStyleProp(property, $.length(value.value, opts));
      }
      return;
    case 'text-decoration-line':
      return addStyleProp(property, $.textDecorationLine(value, opts));
    case 'text-decoration-color':
      return addStyleProp(property, $.color(value, opts));
    case 'text-decoration':
      addStyleProp('text-decoration-color', $.color(value.color, opts));
      addStyleProp('text-decoration-line', $.textDecorationLine(value.line, opts));
      return;
    case 'text-shadow':
      return $.textShadow(value, addStyleProp, opts);
    case 'z-index':
      if (value.type === 'integer') {
        addStyleProp(property, $.length(value.value, opts));
      } else {
        addWarning({type: 'IncompatibleNativeValue', property, value});
      }
      return;
    case 'text-decoration-style':
      return addStyleProp(property, $.textDecorationStyle(value, opts));
    case 'text-align':
      return addStyleProp(property, $.textAlign(value, opts));
    case 'box-shadow':
      return addStyleProp(property, $.boxShadow(value, opts));
    case 'aspect-ratio':
      return addStyleProp(property, $.aspectRatio(value));

    /**
     * CSS Grid to FlexGrid Conversion Strategy
     * =====================================
     *
     * CSS Grid and react-native-flexible-grid (FlexGrid) have fundamentally different approaches:
     *
     * CSS Grid:
     * - Explicit grid with defined rows/columns
     * - Items positioned by line numbers or named areas
     * - Auto-placement with grid-auto-flow
     *
     * FlexGrid:
     * - Ratio-based flexible grid system
     * - Items sized by widthRatio/heightRatio relative to itemSizeUnit
     * - Automatic flow based on available space and ratios
     *
     * Conversion Mapping:
     * - grid-template-columns → maxColumnRatioUnits (column count)
     * - grid-column: span N → widthRatio: N
     * - grid-row: span N → heightRatio: N
     * - Grid positioning (1/3) → calculated ratios
     * - Grid alignment → standard flexbox alignment
     *
     * Limitations:
     * - Named grid areas are not supported (stored as reference only)
     * - Explicit row templates are not used (FlexGrid flows automatically)
     * - Auto-placement strategies are not directly applicable
     * - Complex grid functions (minmax, fit-content) are simplified
     *
     * Required FlexGrid Properties (no CSS equivalent):
     * - itemSizeUnit: Base unit for ratio calculations
     * - data: Array of items to render
     * - renderItem: Function to render each item
     */
    // CSS Grid Properties - converted to react-native-flexible-grid compatible properties
    case 'grid-template-columns':
      // Add default FlexGrid properties on first grid property encounter
      addDefaultFlexGridProperties(addStyleProp);
      // Convert to maxColumnRatioUnits for FlexGrid (this is correct)
      return addStyleProp('maxColumnRatioUnits', $.gridTemplateColumns(value, opts));
    case 'grid-template-rows':
      // FlexGrid doesn't use explicit row templates - items flow based on ratios
      // Store for potential itemSizeUnit calculation
      return addStyleProp('_gridTemplateRows', String(value));
    case 'grid-template-areas':
      // FlexGrid doesn't use named grid areas - store for reference only
      return addStyleProp('_gridTemplateAreas', $.gridTemplateAreas(value, opts));
    case 'grid-template':
      // Shorthand for grid-template-rows, grid-template-columns, and grid-template-areas
      if (value && typeof value === 'object') {
        if ((value as any).columns) {
          addStyleProp('maxColumnRatioUnits', $.gridTemplateColumns((value as any).columns, opts));
        }
        if ((value as any).rows) {
          addStyleProp('_gridTemplateRows', String((value as any).rows));
        }
        if ((value as any).areas) {
          addStyleProp('_gridTemplateAreas', String((value as any).areas));
        }
      }
      return;
    case 'grid-auto-flow':
      // FlexGrid doesn't support auto-flow - items are positioned by ratios
      return addStyleProp('_gridAutoFlow', String(value));
    case 'grid-auto-columns':
      // Store for potential itemSizeUnit calculation
      return addStyleProp('_gridAutoColumns', String(value));
    case 'grid-auto-rows':
      // Store for potential itemSizeUnit calculation
      return addStyleProp('_gridAutoRows', String(value));
    case 'grid':
      // Shorthand for all grid properties - store as reference
      return addStyleProp('_gridShorthand', String(value));

    // Grid Item Properties - convert to FlexGrid ratio system
    case 'grid-column-start':
      return addStyleProp('_gridColumnStart', String(value));
    case 'grid-column-end':
      return addStyleProp('_gridColumnEnd', String(value));
    case 'grid-row-start':
      return addStyleProp('_gridRowStart', String(value));
    case 'grid-row-end':
      return addStyleProp('_gridRowEnd', String(value));
    case 'grid-column':
      // Parse and convert to widthRatio for FlexGrid
      if (value && typeof value === 'object') {
        if (value.start) addStyleProp('_gridColumnStart', String(value.start));
        if (value.end) addStyleProp('_gridColumnEnd', String(value.end));
        // Calculate widthRatio from span
        const start = parseInt(String(value.start || 1), 10);
        const end = parseInt(String(value.end || start + 1), 10);
        const span = end - start;
        if (span > 0) {
          addStyleProp('widthRatio', span);
        }
      } else {
        const strValue = String(value);
        if (strValue.includes('/')) {
          const [start, end] = strValue.split('/').map(s => s.trim());
          addStyleProp('_gridColumnStart', start);
          addStyleProp('_gridColumnEnd', end);
          // Calculate widthRatio from span
          const startNum = parseInt(start, 10);
          const endNum = parseInt(end, 10);
          if (!isNaN(startNum) && !isNaN(endNum)) {
            const span = endNum - startNum;
            if (span > 0) {
              addStyleProp('widthRatio', span);
            }
          }
        } else if (strValue.includes('span')) {
          const spanMatch = strValue.match(/span\s+(\d+)/);
          if (spanMatch) {
            const span = parseInt(spanMatch[1], 10);
            addStyleProp('widthRatio', span);
          }
        } else {
          addStyleProp('_gridColumn', strValue);
        }
      }
      return;
    case 'grid-row':
      // Parse and convert to heightRatio for FlexGrid
      if (value && typeof value === 'object') {
        if (value.start) addStyleProp('_gridRowStart', String(value.start));
        if (value.end) addStyleProp('_gridRowEnd', String(value.end));
        // Calculate heightRatio from span
        const start = parseInt(String(value.start || 1), 10);
        const end = parseInt(String(value.end || start + 1), 10);
        const span = end - start;
        if (span > 0) {
          addStyleProp('heightRatio', span);
        }
      } else {
        const strValue = String(value);
        if (strValue.includes('/')) {
          const [start, end] = strValue.split('/').map(s => s.trim());
          addStyleProp('_gridRowStart', start);
          addStyleProp('_gridRowEnd', end);
          // Calculate heightRatio from span
          const startNum = parseInt(start, 10);
          const endNum = parseInt(end, 10);
          if (!isNaN(startNum) && !isNaN(endNum)) {
            const span = endNum - startNum;
            if (span > 0) {
              addStyleProp('heightRatio', span);
            }
          }
        } else if (strValue.includes('span')) {
          const spanMatch = strValue.match(/span\s+(\d+)/);
          if (spanMatch) {
            const span = parseInt(spanMatch[1], 10);
            addStyleProp('heightRatio', span);
          }
        } else {
          addStyleProp('_gridRow', strValue);
        }
      }
      return;
    case 'grid-area':
      // Parse grid-area and convert to widthRatio/heightRatio
      if (value && typeof value === 'object') {
        if (value.rowStart) addStyleProp('_gridRowStart', String(value.rowStart));
        if (value.columnStart) addStyleProp('_gridColumnStart', String(value.columnStart));
        if (value.rowEnd) addStyleProp('_gridRowEnd', String(value.rowEnd));
        if (value.columnEnd) addStyleProp('_gridColumnEnd', String(value.columnEnd));

        // Calculate ratios from spans
        if (value.columnStart && value.columnEnd) {
          const start = parseInt(String(value.columnStart), 10);
          const end = parseInt(String(value.columnEnd), 10);
          if (!isNaN(start) && !isNaN(end)) {
            const span = end - start;
            if (span > 0) addStyleProp('widthRatio', span);
          }
        }
        if (value.rowStart && value.rowEnd) {
          const start = parseInt(String(value.rowStart), 10);
          const end = parseInt(String(value.rowEnd), 10);
          if (!isNaN(start) && !isNaN(end)) {
            const span = end - start;
            if (span > 0) addStyleProp('heightRatio', span);
          }
        }
      } else {
        const strValue = String(value);
        if (strValue.includes('/')) {
          const parts = strValue.split('/').map(s => s.trim());
          if (parts.length === 4) {
            addStyleProp('_gridRowStart', parts[0]);
            addStyleProp('_gridColumnStart', parts[1]);
            addStyleProp('_gridRowEnd', parts[2]);
            addStyleProp('_gridColumnEnd', parts[3]);

            // Calculate ratios
            const rowStart = parseInt(parts[0], 10);
            const colStart = parseInt(parts[1], 10);
            const rowEnd = parseInt(parts[2], 10);
            const colEnd = parseInt(parts[3], 10);

            if (!isNaN(rowStart) && !isNaN(rowEnd)) {
              const rowSpan = rowEnd - rowStart;
              if (rowSpan > 0) addStyleProp('heightRatio', rowSpan);
            }
            if (!isNaN(colStart) && !isNaN(colEnd)) {
              const colSpan = colEnd - colStart;
              if (colSpan > 0) addStyleProp('widthRatio', colSpan);
            }
          }
        } else {
          // Named grid area - store for reference
          addStyleProp('_gridArea', strValue);
        }
      }
      return;

    // Grid Alignment Properties - FlexGrid uses standard flexbox alignment
    case 'justify-items':
      // Map to standard justifyContent for FlexGrid items
      return addStyleProp('justifyContent', String(value));
    case 'place-items':
      // Shorthand for align-items and justify-items
      if (value && typeof value === 'object') {
        addStyleProp('alignItems', String((value as any).align || value));
        addStyleProp('justifyContent', String((value as any).justify || value));
      } else {
        const strValue = String(value);
        addStyleProp('alignItems', strValue);
        addStyleProp('justifyContent', strValue);
      }
      return;
    case 'place-content':
      // Shorthand for align-content and justify-content
      if (value && typeof value === 'object') {
        addStyleProp('alignContent', String((value as any).align || value));
        addStyleProp('justifyContent', String((value as any).justify || value));
      } else {
        const strValue = String(value);
        addStyleProp('alignContent', strValue);
        addStyleProp('justifyContent', strValue);
      }
      return;
    case 'justify-self':
      // Map to alignSelf for FlexGrid items
      return addStyleProp('alignSelf', String(value));
    case 'place-self':
      // Shorthand for align-self and justify-self
      if (value && typeof value === 'object') {
        addStyleProp('alignSelf', String((value as any).align || value));
        // justify-self maps to alignSelf in FlexGrid context
        addStyleProp('alignSelf', String((value as any).justify || (value as any).align || value));
      } else {
        const strValue = String(value);
        addStyleProp('alignSelf', strValue);
      }
      return;
    case 'container-type':
    case 'container-name':
    case 'container':
      return addWarning({type: 'IncompatibleNativeValue', property, value});
    case 'transition-property':
    case 'transition-duration':
    case 'transition-delay':
    case 'transition-timing-function':
    case 'transition':
    case 'animation-duration':
    case 'animation-timing-function':
    case 'animation-iteration-count':
    case 'animation-direction':
    case 'animation-play-state':
    case 'animation-delay':
    case 'animation-fill-mode':
    case 'animation-name':
    case 'animation':
    case 'transform':
    case 'translate':
    case 'rotate':
    case 'scale':
      return; // Note: animations are handled separately
    default: {
      /**
       * This is used to know when lightningcss has added a new property and we need to add it to the
       * switch.
       *
       * If your build fails here, its because you have a newer version of lightningcss installed.
       */
      declaration satisfies never;
    }
  }
}

function parseUnparsedProperty(declaration: Declaration, options: ParseDeclarationOptions) {
  if (declaration.property !== 'unparsed') return;

  const {addStyleProp, addWarning} = options;
  const {propertyId, value} = declaration.value;
  const {property} = propertyId;

  if (!isValid(propertyId)) {
    return addWarning({type: 'IncompatibleNativeProperty', property});
  }

  const opts = {
    ...options,
    addValueWarning: (v: any) => addWarning({type: 'IncompatibleNativeValue', property, value: v}),
    addFunctionValueWarning: (v: any) => addWarning({type: 'IncompatibleNativeFunctionValue', property, value: v}),
  };

  const getValues = (value: TokenOrValue[]) => {
    const values = $.unparsed(value, opts);
    return Array.isArray(values) ? values : [values];
  };

  switch (property) {
    case 'margin': {
      const [top, left, bottom, right] = getValues(value);
      if (top && right === undefined && bottom === undefined && left === undefined)
        return addStyleProp('margin', top);
      addStyleProp('margin-top', top);
      addStyleProp('margin-bottom', bottom ?? top);
      addStyleProp('margin-left', left);
      addStyleProp('margin-right', right ?? left);
      return;
    }
    case 'padding': {
      const [top, left, bottom, right] = getValues(value);
      if (top && right === undefined && bottom === undefined && left === undefined)
        return addStyleProp('padding', top);
      addStyleProp('padding-top', top);
      addStyleProp('padding-left', left);
      addStyleProp('padding-bottom', bottom ?? top);
      addStyleProp('padding-right', right ?? left);
      return;
    }
    case 'gap': {
      const [row, column] = getValues(value);
      if (row && column === undefined || row === column)
        return addStyleProp('gap', row);
      addStyleProp('row-gap', row);
      addStyleProp('column-gap', column);
      return;
    }
    case 'border': {
      const [width, style, color] = getValues(value);
      addStyleProp('border-width', width);
      if (style)
        addStyleProp('border-style', style);
      if (color)
        addStyleProp('border-color', color);
      return;
    }
    default: {
      return addStyleProp(property, getValues(value)[0]);
    }
  }
}

function parseCustomProperty(declaration: Declaration, options: ParseDeclarationOptions) {
  if (declaration.property !== 'custom') return;
  const {addStyleProp, addWarning} = options;
  const property = declaration.value.name;
  const value = declaration.value.value;
  const opts = {
    ...options,
    addValueWarning: (v: any) => addWarning({type: 'IncompatibleNativeValue', property, value: v}),
    addFunctionValueWarning: (v: any) => addWarning({type: 'IncompatibleNativeFunctionValue', property, value: v}),
  };

  const validPrefixes = ['--', '-rn-'];
  if (validPropertiesLoose.has(property) || validPrefixes.some(v => property.startsWith(v))) {
    return addStyleProp(property, $.unparsed(value, opts));
  } else {
    return addWarning({type: 'IncompatibleNativeProperty', property});
  }
}
