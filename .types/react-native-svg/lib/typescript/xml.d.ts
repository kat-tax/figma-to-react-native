import type { ComponentType, ComponentProps } from 'react';
import * as React from 'react';
import { Component } from 'react';
import type { SvgProps } from './elements/Svg';
import { tags } from './xmlTags';
type Tag = ComponentType<ComponentProps<(typeof tags)[keyof typeof tags]>>;
export interface AST {
    tag: string;
    style?: Styles;
    styles?: string;
    priority?: Map<string, boolean | undefined>;
    parent: AST | null;
    children: (AST | string)[] | (JSX.Element | string)[];
    props: {
        [prop: string]: Styles | string | undefined;
    };
    Tag: Tag;
}
export interface XmlAST extends AST {
    children: (XmlAST | string)[];
    parent: XmlAST | null;
}
export interface JsxAST extends AST {
    children: (JSX.Element | string)[];
}
export type AdditionalProps = {
    onError?: (error: Error) => void;
    override?: object;
    onLoad?: () => void;
    fallback?: JSX.Element;
};
export type UriProps = SvgProps & {
    uri: string | null;
} & AdditionalProps;
export type UriState = {
    xml: string | null;
};
export type XmlProps = SvgProps & {
    xml: string | null;
} & AdditionalProps;
export type XmlState = {
    ast: JsxAST | null;
};
export type AstProps = SvgProps & {
    ast: JsxAST | null;
} & AdditionalProps;
export declare function SvgAst({ ast, override }: AstProps): React.JSX.Element | null;
export declare function SvgXml(props: XmlProps): React.JSX.Element | null;
export declare function SvgUri(props: UriProps): React.JSX.Element | null;
export declare class SvgFromXml extends Component<XmlProps, XmlState> {
    state: {
        ast: null;
    };
    componentDidMount(): void;
    componentDidUpdate(prevProps: {
        xml: string | null;
    }): void;
    parse(xml: string | null): void;
    render(): React.JSX.Element;
}
export declare class SvgFromUri extends Component<UriProps, UriState> {
    state: {
        xml: null;
    };
    componentDidMount(): void;
    componentDidUpdate(prevProps: {
        uri: string | null;
    }): void;
    fetch(uri: string | null): Promise<void>;
    render(): React.JSX.Element;
}
export declare const camelCase: (phrase: string) => string;
export type Styles = {
    [property: string]: string;
};
export declare function getStyle(string: string): Styles;
export declare function astToReact(value: AST | string, index: number): JSX.Element | string;
export type Middleware = (ast: XmlAST) => XmlAST;
export declare function parse(source: string, middleware?: Middleware): JsxAST | null;
export { tags };
//# sourceMappingURL=xml.d.ts.map