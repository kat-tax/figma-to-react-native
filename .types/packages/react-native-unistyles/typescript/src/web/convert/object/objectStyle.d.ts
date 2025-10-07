type Styles = Record<string, any>;
type Normalize<TStyles extends Styles> = (key: keyof TStyles, value: TStyles[keyof TStyles]) => any;
export declare const getObjectStyle: <TStyles extends Styles>(styles: Array<TStyles>, styleKey: string, normalize: Normalize<TStyles>) => Record<string, any>;
export {};
//# sourceMappingURL=objectStyle.d.ts.map