import * as $ from './declarations/_index';
import {isValid, validPropertiesLoose} from './properties';

import type {Declaration} from 'lightningcss-wasm';
import type {ParseDeclarationOptions} from './types/parse';

export function parseDeclaration(d: Declaration, opts: ParseDeclarationOptions) {
  const {
    addWarning,
    addStyleProp,
    addAnimationProp,
    addTransitionProp,
    handleStyleShorthand,
  } = opts;

  if (d.property === 'unparsed') {
    if (!isValid(d.value.propertyId)) {
      return addWarning({type: 'IncompatibleNativeProperty', property: d.value.propertyId.property});
    }
    console.log('unparsed', d.value.propertyId.property, d.value);
    return addStyleProp(
      d.value.propertyId.property,
      $.unparsed(d.value.value, {
        ...opts,
        addFunctionValueWarning(value: any) {
          return addWarning({type: 'IncompatibleNativeFunctionValue', property: d.value.propertyId.property, value});
        },
        addValueWarning(value: any) {
          return addWarning({type: 'IncompatibleNativeValue', property: d.value.propertyId.property, value});
        },
      }),
    );
  } else if (d.property === 'custom') {
    const property = d.value.name;
    if (
      validPropertiesLoose.has(property) ||
      property.startsWith('--') ||
      property.startsWith('-rn-')
    ) {
      return addStyleProp(
        property,
        $.unparsed(d.value.value, {
          ...opts,
          addValueWarning(value: any) {
            return addWarning({type: 'IncompatibleNativeValue', property, value});
          },
          addFunctionValueWarning(value: any) {
            return addWarning({type: 'IncompatibleNativeFunctionValue', property, value});
          },
        }),
      );
    } else {
      return addWarning({type: 'IncompatibleNativeProperty', property: d.value.name});
    }
  }

  const options = {
    ...opts,
    addValueWarning(value: any) {
      return addWarning({type: 'IncompatibleNativeValue', property: d.property, value});
    },
    addFunctionValueWarning(value: any) {
      return addWarning({type: 'IncompatibleNativeFunctionValue', property: d.property, value});
    },
  };

  const addInvalidProperty = () => {
    return addWarning({type: 'IncompatibleNativeProperty', property: d.property});
  };

  if (!isValid(d)) {
    return addInvalidProperty();
  }

  switch (d.property) {
    case 'background-color':
      return addStyleProp(d.property, $.color(d.value, options));
    case 'opacity':
      return addStyleProp(d.property, d.value);
    case 'color':
      return addStyleProp(d.property, $.color(d.value, options));
    case 'display':
      return addStyleProp(d.property, $.display(d.value, options));
    case 'width':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'height':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'min-width':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'min-height':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'max-width':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'max-height':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'block-size':
      return addStyleProp('width', $.size(d.value, options));
    case 'inline-size':
      return addStyleProp('height', $.size(d.value, options));
    case 'min-block-size':
      return addStyleProp('min-width', $.size(d.value, options));
    case 'min-inline-size':
      return addStyleProp('min-height', $.size(d.value, options));
    case 'max-block-size':
      return addStyleProp('max-width', $.size(d.value, options));
    case 'max-inline-size':
      return addStyleProp('max-height', $.size(d.value, options));
    case 'overflow':
      return addStyleProp(d.property, $.overflow(d.value.x, options));
    case 'position':
      return; // Note: position works differently on web and native
    case 'top':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'bottom':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'left':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'right':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'inset-block-start':
      return addStyleProp(d.property, $.lengthPercentageOrAuto(d.value, options));
    case 'inset-block-end':
      return addStyleProp(d.property, $.lengthPercentageOrAuto(d.value, options));
    case 'inset-inline-start':
      return addStyleProp( d.property, $.lengthPercentageOrAuto(d.value, options));
    case 'inset-inline-end':
      return addStyleProp(d.property, $.lengthPercentageOrAuto(d.value, options));
    case 'inset-block':
      addStyleProp('inset-block-start', $.lengthPercentageOrAuto(d.value.blockStart, options));
      addStyleProp('inset-block-end', $.lengthPercentageOrAuto(d.value.blockEnd, options));
      return;
    case 'inset-inline':
      addStyleProp('inset-inline-start', $.lengthPercentageOrAuto(d.value.inlineStart, options));
      addStyleProp('inset-inline-end', $.lengthPercentageOrAuto(d.value.inlineEnd, options));
      return;
    case 'inset':
      handleStyleShorthand('inset', {
        top: $.lengthPercentageOrAuto(d.value.top, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'top', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'top', value});
          },
        }),
        bottom: $.lengthPercentageOrAuto(d.value.bottom, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'bottom', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'bottom', value});
          },
        }),
        left: $.lengthPercentageOrAuto(d.value.left, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'left', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'left', value});
          },
        }),
        right: $.lengthPercentageOrAuto(d.value.right, {
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
      return addStyleProp(d.property, $.color(d.value, options));
    case 'border-bottom-color':
      return addStyleProp(d.property, $.color(d.value, options));
    case 'border-left-color':
      return addStyleProp(d.property, $.color(d.value, options));
    case 'border-right-color':
      return addStyleProp(d.property, $.color(d.value, options));
    case 'border-block-start-color':
      return addStyleProp('border-top-color', $.color(d.value, options));
    case 'border-block-end-color':
      return addStyleProp('border-bottom-color', $.color(d.value, options));
    case 'border-inline-start-color':
      return addStyleProp('border-left-color', $.color(d.value, options));
    case 'border-inline-end-color':
      return addStyleProp('border-right-color', $.color(d.value, options));
    case 'border-top-width':
      return addStyleProp(d.property, $.borderSideWidth(d.value, options));
    case 'border-bottom-width':
      return addStyleProp(d.property, $.borderSideWidth(d.value, options));
    case 'border-left-width':
      return addStyleProp(d.property, $.borderSideWidth(d.value, options));
    case 'border-right-width':
      return addStyleProp(d.property, $.borderSideWidth(d.value, options));
    case 'border-block-start-width':
      return addStyleProp('border-top-width', $.borderSideWidth(d.value, options));
    case 'border-block-end-width':
      return addStyleProp('border-bottom-width', $.borderSideWidth(d.value, options));
    case 'border-inline-start-width':
      return addStyleProp('border-left-width', $.borderSideWidth(d.value, options));
    case 'border-inline-end-width':
      return addStyleProp('border-right-width', $.borderSideWidth(d.value, options));
    case 'border-top-left-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-top-right-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-bottom-left-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-bottom-right-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-start-start-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-start-end-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-end-start-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-end-end-radius':
      return addStyleProp(d.property, $.length(d.value[0], options));
    case 'border-radius':
      addStyleProp('border-bottom-left-radius', $.length(d.value.bottomLeft[0], options));
      addStyleProp('border-bottom-right-radius', $.length(d.value.bottomRight[0], options));
      addStyleProp('border-top-left-radius', $.length(d.value.topLeft[0], options));
      addStyleProp('border-top-right-radius', $.length(d.value.topRight[0], options));
      return;
    case 'border-color':
      handleStyleShorthand('border-color', {
        'border-top-color': $.color(d.value.top, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'border-top-color', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'border-top-color', value});
          },
        }),
        'border-bottom-color': $.color(d.value.bottom, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'border-bottom-color', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'border-bottom-color', value});
          },
        }),
        'border-left-color': $.color(d.value.left, {
          ...options,
          addValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeValue', property: 'border-left-color', value});
          },
          addFunctionValueWarning(value: any) {
            addWarning({type: 'IncompatibleNativeFunctionValue', property: 'border-left-color', value});
          },
        }),
        'border-right-color': $.color(d.value.right, {
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
      return addStyleProp(d.property, $.borderStyle(d.value, options));
    case 'border-width':
      addStyleProp('border-top-width', $.borderSideWidth(d.value.top, options));
      addStyleProp('border-bottom-width', $.borderSideWidth(d.value.bottom, options));
      addStyleProp('border-left-width', $.borderSideWidth(d.value.left, options));
      addStyleProp('border-right-width', $.borderSideWidth(d.value.right, options));
      return;
    case 'border-block-color':
      addStyleProp('border-top-color', $.color(d.value.start, options));
      addStyleProp('border-bottom-color', $.color(d.value.end, options));
      return;
    case 'border-block-width':
      addStyleProp('border-top-width', $.borderSideWidth(d.value.start, options));
      addStyleProp('border-bottom-width', $.borderSideWidth(d.value.end, options));
      return;
    case 'border-inline-color':
      addStyleProp('border-left-color', $.color(d.value.start, options));
      addStyleProp('border-right-color', $.color(d.value.end, options));
      return;
    case 'border-inline-width':
      addStyleProp('border-left-width', $.borderSideWidth(d.value.start, options));
      addStyleProp('border-right-width', $.borderSideWidth(d.value.end, options));
      return;
    case 'border':
      addStyleProp('border-width', $.borderSideWidth(d.value.width, options));
      addStyleProp('border-style', $.borderStyle(d.value.style, options));
      addStyleProp('border-color', $.color(d.value.color, options));
      return;
    case 'border-top':
      addStyleProp(d.property + '-color', $.color(d.value.color, options));
      addStyleProp(d.property + '-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-bottom':
      addStyleProp(d.property + '-color', $.color(d.value.color, options));
      addStyleProp(d.property + '-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-left':
      addStyleProp(d.property + '-color', $.color(d.value.color, options));
      addStyleProp(d.property + '-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-right':
      addStyleProp(d.property + '-color', $.color(d.value.color, options));
      addStyleProp(d.property + '-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-block':
      addStyleProp('border-top-color', $.color(d.value.color, options));
      addStyleProp('border-bottom-color', $.color(d.value.color, options));
      addStyleProp('border-top-width', $.borderSideWidth(d.value.width, options));
      addStyleProp('border-bottom-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-block-start':
      addStyleProp('border-top-color', $.color(d.value.color, options));
      addStyleProp('border-top-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-block-end':
      addStyleProp('border-bottom-color', $.color(d.value.color, options));
      addStyleProp('border-bottom-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-inline':
      addStyleProp('border-left-color', $.color(d.value.color, options));
      addStyleProp('border-right-color', $.color(d.value.color, options));
      addStyleProp('border-left-width', $.borderSideWidth(d.value.width, options));
      addStyleProp('border-right-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-inline-start':
      addStyleProp('border-left-color', $.color(d.value.color, options));
      addStyleProp('border-left-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'border-inline-end':
      addStyleProp('border-right-color', $.color(d.value.color, options));
      addStyleProp('border-right-width', $.borderSideWidth(d.value.width, options));
      return;
    case 'flex-direction':
      return addStyleProp(d.property, d.value);
    case 'flex-wrap':
      return addStyleProp(d.property, d.value);
    case 'flex-flow':
      addStyleProp('flexWrap', d.value.wrap);
      addStyleProp('flexDirection', d.value.direction);
      return;
    case 'flex-grow':
      return addStyleProp(d.property, d.value);
    case 'flex-shrink':
      return addStyleProp(d.property, d.value);
    case 'flex-basis':
      return addStyleProp(d.property, $.lengthPercentageOrAuto(d.value, options));
    case 'flex':
      addStyleProp('flex-grow', d.value.grow);
      addStyleProp('flex-shrink', d.value.shrink);
      addStyleProp('flex-basis', $.lengthPercentageOrAuto(d.value.basis, options));
      return;
    case 'align-content':
      return addStyleProp(d.property, $.alignContent(d.value, options));
    case 'justify-content':
      return addStyleProp( d.property, $.justifyContent(d.value, options));
    case 'align-self':
      return addStyleProp(d.property, $.alignSelf(d.value, options));
    case 'align-items':
      return addStyleProp(d.property, $.alignItems(d.value, options));
    case 'row-gap':
      return addStyleProp('row-gap', $.gap(d.value, options));
    case 'column-gap':
      return addStyleProp('row-gap', $.gap(d.value, options));
    case 'gap':
      addStyleProp('row-gap', $.gap(d.value.row, options));
      addStyleProp('column-gap', $.gap(d.value.column, options));
      return;
    case 'margin-top':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'margin-bottom':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'margin-left':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'margin-right':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'margin-block-start':
      return addStyleProp('margin-start', $.lengthPercentageOrAuto(d.value, options));
    case 'margin-block-end':
      return addStyleProp('margin-end', $.lengthPercentageOrAuto(d.value, options));
    case 'margin-inline-start':
      return addStyleProp('margin-start', $.lengthPercentageOrAuto(d.value, options));
    case 'margin-inline-end':
      return addStyleProp('margin-end', $.lengthPercentageOrAuto(d.value, options));
    case 'margin':
      addStyleProp('margin-top', $.size(d.value.top, options));
      addStyleProp('margin-bottom', $.size(d.value.bottom, options));
      addStyleProp('margin-left', $.size(d.value.left, options));
      addStyleProp('margin-right', $.size(d.value.right, options));
      return;
    case 'margin-block':
      addStyleProp('margin-start', $.lengthPercentageOrAuto(d.value.blockStart, options));
      addStyleProp('margin-end', $.lengthPercentageOrAuto(d.value.blockEnd, options));
      return;
    case 'margin-inline':
      addStyleProp('margin-start', $.lengthPercentageOrAuto(d.value.inlineStart, options));
      addStyleProp('margin-end', $.lengthPercentageOrAuto(d.value.inlineEnd, options));
      return;
    case 'padding':
      console.log('[padding]', d.value);
      addStyleProp('padding-top', $.size(d.value.top, options));
      addStyleProp('padding-bottom', $.size(d.value.bottom, options));
      addStyleProp('padding-left', $.size(d.value.left, options));
      addStyleProp('padding-right', $.size(d.value.right, options));
      return;
    case 'padding-top':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'padding-bottom':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'padding-left':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'padding-right':
      return addStyleProp(d.property, $.size(d.value, options));
    case 'padding-block-start':
      return addStyleProp('padding-start', $.lengthPercentageOrAuto(d.value, options));
    case 'padding-block-end':
      return addStyleProp('padding-end', $.lengthPercentageOrAuto(d.value, options));
    case 'padding-inline-start':
      return addStyleProp('padding-start', $.lengthPercentageOrAuto(d.value, options));
    case 'padding-inline-end':
      return addStyleProp('padding-end', $.lengthPercentageOrAuto(d.value, options));
    case 'padding-block':
      addStyleProp('padding-start', $.lengthPercentageOrAuto(d.value.blockStart, options));
      addStyleProp('padding-end', $.lengthPercentageOrAuto(d.value.blockEnd, options));
      return;
    case 'padding-inline':
      addStyleProp('padding-start', $.lengthPercentageOrAuto(d.value.inlineStart, options));
      addStyleProp('padding-end', $.lengthPercentageOrAuto(d.value.inlineEnd, options));
      return;
    case 'font-weight':
      return addStyleProp(d.property, $.fontWeight(d.value, options));
    case 'font-size':
      return addStyleProp(d.property, $.fontSize(d.value, options));
    case 'font-family':
      return addStyleProp(d.property, $.fontFamily(d.value));
    case 'font-style':
      return addStyleProp(d.property, $.fontStyle(d.value, options));
    case 'font-variant-caps':
      return addStyleProp(d.property, $.fontVariantCaps(d.value, options));
    case 'line-height':
      return addStyleProp(d.property, $.lineHeight(d.value, options));
    case 'font':
      addStyleProp(d.property + '-family', $.fontFamily(d.value.family));
      addStyleProp('line-height', $.lineHeight(d.value.lineHeight, options));
      addStyleProp(d.property + '-size', $.fontSize(d.value.size, options));
      addStyleProp(d.property + '-style', $.fontStyle(d.value.style, options));
      addStyleProp(d.property + '-variant', $.fontVariantCaps(d.value.variantCaps, options));
      addStyleProp(d.property + '-weight', $.fontWeight(d.value.weight, options));
      return;
    case 'vertical-align':
      return addStyleProp(d.property, $.verticalAlign(d.value, options));
    case 'transition-property':
    case 'transition-duration':
    case 'transition-delay':
    case 'transition-timing-function':
    case 'transition':
      return addTransitionProp(d);
    case 'animation-duration':
    case 'animation-timing-function':
    case 'animation-iteration-count':
    case 'animation-direction':
    case 'animation-play-state':
    case 'animation-delay':
    case 'animation-fill-mode':
    case 'animation-name':
    case 'animation':
      return addAnimationProp(d.property, d.value);
    case 'transform': {
      return addStyleProp(d.property, $.transform(d.value, options));
    }
    case 'translate':
      return addStyleProp(
        'transform',
        [
          {translateX: d.value.x},
          {translateY: d.value.y},
        ],
        {append: true},
      );
    case 'rotate':
      return addStyleProp(
        'transform',
        [
          {rotateX: d.value.x},
          {rotateY: d.value.y},
          {rotateY: d.value.z},
        ],
        {append: true},
      );
    case 'scale':
      return addStyleProp(
        'transform',
        [
          {scaleX: $.length(d.value.x, options)},
          {scaleY: $.length(d.value.y, options)},
        ],
        {append: true},
      );
    case 'text-transform':
      return addStyleProp(d.property, d.value.case);
    case 'letter-spacing':
      if (d.value.type !== 'normal') {
        return addStyleProp(d.property, $.length(d.value.value, options));
      }
      return;
    case 'text-decoration-line':
      return addStyleProp(d.property, $.textDecorationLine(d.value, options));
    case 'text-decoration-color':
      return addStyleProp(d.property, $.color(d.value, options));
    case 'text-decoration':
      addStyleProp('text-decoration-color', $.color(d.value.color, options));
      addStyleProp('text-decoration-line', $.textDecorationLine(d.value.line, options));
      return;
    case 'text-shadow':
      return $.textShadow(d.value, addStyleProp, options);
    case 'z-index':
      if (d.value.type === 'integer') {
        addStyleProp(d.property, $.length(d.value.value, options));
      } else {
        addWarning({type: 'IncompatibleNativeValue', property: d.property, value: d.value});
      }
      return;
    case 'text-decoration-style':
      return addStyleProp(d.property, $.textDecorationStyle(d.value, options));
    case 'text-align':
      return addStyleProp(d.property, $.textAlign(d.value, options));
    case 'box-shadow':
      return addStyleProp(d.property, $.boxShadow(d.value, options));
    case 'aspect-ratio':
      return addStyleProp(d.property, $.aspectRatio(d.value));
    case 'container-type':
    case 'container-name':
    case 'container':
      return addWarning({type: 'IncompatibleNativeValue', property: d.property, value: d.value});
    default: {
      /**
       * This is used to know when lightningcss has added a new property and we need to add it to the
       * switch.
       *
       * If your build fails here, its because you have a newer version of lightningcss installed.
       */
      d satisfies never;
    }
  }
}
