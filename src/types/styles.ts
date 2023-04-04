export type Styles =
    StylesDimension
  & StylesPosition
  & StylesLayout
  & StylesPadding
  & StylesBackground
  & StylesTypography;

export interface StylesDimension {
  flex?: string,
  width?: number | string,
  height?: number | string,
}

export interface StylesPosition {
  position?: string,
  left?: number,
  right?: number,
  top?: number,
  bottom?: number,
}

export interface StylesLayout {
  display?: string,
  flexDirection?: string,
  justifyContent?: string,
  alignItems?: string,
  gap?: number,
}

export interface StylesPadding {
  padding?: number,
  paddingTop?: number,
  paddingRight?: number,
  paddingBottom?: number,
  paddingLeft?: number,
  paddingVertical?: number,
  paddingHorizontal?: number,
}

export interface StylesBackground {
  backgroundColor?: string,
}

export interface StylesBorder {
  borderColor?: string,
  borderStyle?: string,
  borderWidth?: number,
  borderRadius?: number,
  borderTopLeftRadius?: number,
  borderTopRightRadius?: number,
  borderBottomLeftRadius?: number,
  borderBottomRightRadius?: number,
}

export interface StylesTypography {
  color?: string,
  fontSize?: number,
  fontWeight?: number,
  fontFamily?: string,
  fontStyle?: string,
  lineHeight?: number,
  letterSpacing?: number,
  textAlign?: string,
  textAlignVertical?: string,
  textDecorationLine?: string,
}
