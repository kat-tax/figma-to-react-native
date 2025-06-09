import * as $ from './declarations/_index';
import {isValid, validPropertiesLoose} from './val';

import type {Declaration, TokenOrValue} from 'lightningcss-wasm';
import type {ParseDeclarationOptions} from './types';

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
    case 'grid-auto-columns':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-auto-flow':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-auto-rows':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-column-end':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-column-start':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-row-end':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-row-start':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-template-areas':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-template-columns':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-template-rows':
      return addStyleProp(property, $.grid(value, opts));
    case 'justify-items':
      return addStyleProp(property, $.grid(value, opts));
    case 'justify-self':
      return addStyleProp(property, $.grid(value, opts));
    case 'grid-column':
      // grid-column: <grid-line> [ / <grid-line> ]?
      if (value && typeof value === 'object' && value.start && value.end) {
        addStyleProp('grid-column-start', $.grid(value.start, opts));
        addStyleProp('grid-column-end', $.grid(value.end, opts));
      } else {
        // Fallback for unparsed values
        addStyleProp(property, $.grid(value, opts));
      }
      return;
    case 'grid-row':
      // grid-row: <grid-line> [ / <grid-line> ]?
      if (value && typeof value === 'object' && value.start && value.end) {
        addStyleProp('grid-row-start', $.grid(value.start, opts));
        addStyleProp('grid-row-end', $.grid(value.end, opts));
      } else {
        // Fallback for unparsed values
        addStyleProp(property, $.grid(value, opts));
      }
      return;
    case 'grid-area':
      // grid-area: <grid-line> [ / <grid-line> [ / <grid-line> [ / <grid-line> ]? ]? ]?
      // Order: row-start / column-start / row-end / column-end
      if (value && typeof value === 'object') {
        if (value.rowStart) addStyleProp('grid-row-start', $.grid(value.rowStart, opts));
        if (value.columnStart) addStyleProp('grid-column-start', $.grid(value.columnStart, opts));
        if (value.rowEnd) addStyleProp('grid-row-end', $.grid(value.rowEnd, opts));
        if (value.columnEnd) addStyleProp('grid-column-end', $.grid(value.columnEnd, opts));
        // Only add fallback if no individual properties were found
        if (!value.rowStart && !value.columnStart && !value.rowEnd && !value.columnEnd) {
          addStyleProp(property, $.grid(value, opts));
        }
      } else {
        // Fallback for unparsed values (named areas, etc.)
        addStyleProp(property, $.grid(value, opts));
      }
      return;
    case 'grid-template':
      // grid-template: none | [ <'grid-template-rows'> / <'grid-template-columns'> ] | [ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?
      if (value && typeof value === 'object') {
        if (value.rows) addStyleProp('grid-template-rows', $.grid(value.rows, opts));
        if (value.columns) addStyleProp('grid-template-columns', $.grid(value.columns, opts));
        if (value.areas) addStyleProp('grid-template-areas', $.grid(value.areas, opts));
        // Only add fallback if no individual properties were found
        if (!value.rows && !value.columns && !value.areas) {
          addStyleProp(property, $.grid(value, opts));
        }
      } else {
        // Fallback for unparsed values
        addStyleProp(property, $.grid(value, opts));
      }
      return;
    case 'grid':
      // grid: <'grid-template'> | <'grid-template-rows'> / [ auto-flow && dense? ] <'grid-auto-columns'>? | [ auto-flow && dense? ] <'grid-auto-rows'>? / <'grid-template-columns'>
      if (value && typeof value === 'object') {
        // Handle grid-template shorthand within grid
        if ('template' in value && value.template) {
          const template = value.template as any;
          if (template.rows) addStyleProp('grid-template-rows', $.grid(template.rows, opts));
          if (template.columns) addStyleProp('grid-template-columns', $.grid(template.columns, opts));
          if (template.areas) addStyleProp('grid-template-areas', $.grid(template.areas, opts));
        }
        // Handle auto-flow syntax
        if ('autoFlow' in value && value.autoFlow) addStyleProp('grid-auto-flow', $.grid(value.autoFlow, opts));
        if ('autoRows' in value && value.autoRows) addStyleProp('grid-auto-rows', $.grid(value.autoRows, opts));
        if ('autoColumns' in value && value.autoColumns) addStyleProp('grid-auto-columns', $.grid(value.autoColumns, opts));
        if ('templateRows' in value && (value as any).templateRows) addStyleProp('grid-template-rows', $.grid((value as any).templateRows, opts));
        if ('templateColumns' in value && (value as any).templateColumns) addStyleProp('grid-template-columns', $.grid((value as any).templateColumns, opts));

        // Only add fallback if no individual properties were found
        const hasProps = ('template' in value && value.template) ||
                        ('autoFlow' in value && value.autoFlow) ||
                        ('autoRows' in value && value.autoRows) ||
                        ('autoColumns' in value && value.autoColumns) ||
                        ('templateRows' in value && (value as any).templateRows) ||
                        ('templateColumns' in value && (value as any).templateColumns);
        if (!hasProps) {
          addStyleProp(property, $.grid(value, opts));
        }
      } else {
        // Fallback for unparsed values
        addStyleProp(property, $.grid(value, opts));
      }
      return;
    case 'place-content':
      // place-content: <'align-content'> <'justify-content'>?
      if (value && typeof value === 'object' && (value.align || value.justify)) {
        handleStyleShorthand('place-content', {
          'align-content': $.grid(value.align || value, opts),
          'justify-content': $.grid(value.justify || value.align || value, opts),
        });
      } else {
        // Single value applies to both or fallback
        handleStyleShorthand('place-content', {
          'align-content': $.grid(value, opts),
          'justify-content': $.grid(value, opts),
        });
      }
      return;
    case 'place-items':
      // place-items: <'align-items'> <'justify-items'>?
      if (value && typeof value === 'object' && (value.align || value.justify)) {
        handleStyleShorthand('place-items', {
          'align-items': $.grid(value.align || value, opts),
          'justify-items': $.grid(value.justify || value.align || value, opts),
        });
      } else {
        // Single value applies to both or fallback
        handleStyleShorthand('place-items', {
          'align-items': $.grid(value, opts),
          'justify-items': $.grid(value, opts),
        });
      }
      return;
    case 'place-self':
      // place-self: <'align-self'> <'justify-self'>?
      if (value && typeof value === 'object' && (value.align || value.justify)) {
        handleStyleShorthand('place-self', {
          'align-self': $.grid(value.align || value, opts),
          'justify-self': $.grid(value.justify || value.align || value, opts),
        });
      } else {
        // Single value applies to both or fallback
        handleStyleShorthand('place-self', {
          'align-self': $.grid(value, opts),
          'justify-self': $.grid(value, opts),
        });
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
