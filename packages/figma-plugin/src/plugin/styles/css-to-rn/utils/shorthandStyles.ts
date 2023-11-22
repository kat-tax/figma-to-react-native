import type {ParseStyles} from 'types/parse';

export function shorthandStyles(styles: ParseStyles): ParseStyles {
  // Padding
  if (styles.paddingLeft !== undefined
    && styles.paddingLeft === styles.paddingTop
    && styles.paddingLeft === styles.paddingRight
    && styles.paddingLeft === styles.paddingBottom) {
    styles.padding = styles.paddingLeft;
    delete styles.paddingTop;
    delete styles.paddingLeft;
    delete styles.paddingRight;
    delete styles.paddingBottom;
  } else {
    if (styles.paddingTop !== undefined
      && styles.paddingTop === styles.paddingBottom) {
      styles.paddingVertical = styles.paddingTop;
      delete styles.paddingTop;
      delete styles.paddingBottom;
    }
    if (styles.paddingLeft !== undefined
      && styles.paddingLeft === styles.paddingRight) {
      styles.paddingHorizontal = styles.paddingLeft;
      delete styles.paddingLeft;
      delete styles.paddingRight;
    }
  }
  // Margin
  if (styles.marginLeft !== undefined
    && styles.marginLeft === styles.marginTop
    && styles.marginLeft === styles.marginRight
    && styles.marginLeft === styles.marginBottom) {
    styles.margin = styles.marginLeft;
    delete styles.marginTop;
    delete styles.marginLeft;
    delete styles.marginRight;
    delete styles.marginBottom;
  } else {
    if (styles.marginTop !== undefined
      && styles.marginTop === styles.marginBottom) {
      styles.marginVertical = styles.marginTop;
      delete styles.marginTop;
      delete styles.marginBottom;
    }
    if (styles.marginLeft !== undefined
      && styles.marginLeft === styles.marginRight) {
      styles.marginHorizontal = styles.marginLeft;
      delete styles.marginLeft;
      delete styles.marginRight;
    }
    // Border radius
    if (styles.borderTopLeftRadius !== undefined
      && styles.borderTopLeftRadius === styles.borderTopRightRadius
      && styles.borderTopLeftRadius === styles.borderBottomLeftRadius
      && styles.borderTopLeftRadius === styles.borderBottomRightRadius) {
      styles.borderRadius = styles.borderTopLeftRadius;
      delete styles.borderTopLeftRadius;
      delete styles.borderTopRightRadius;
      delete styles.borderBottomLeftRadius;
      delete styles.borderBottomRightRadius;
    }
  }
  return styles;
}