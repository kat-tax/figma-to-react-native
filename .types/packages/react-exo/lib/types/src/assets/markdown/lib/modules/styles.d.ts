export type StyleTuple = [string, string];
export interface Style {
    [key: string]: string | number | Style;
}
export declare const textStyles: string[];
export declare function removeTextStyleProps(style: Style): Style;
export declare function convertInlineStyles(_style: string): Style;
