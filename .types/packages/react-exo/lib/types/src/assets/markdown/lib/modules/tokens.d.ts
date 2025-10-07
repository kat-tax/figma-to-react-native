import { default as Token } from 'markdown-it/lib/token';
import { default as MarkdownIt } from 'markdown-it';
import { ASTNode, RenderRules } from '../types';
export declare function toAST(tokens: ReadonlyArray<Token>): ASTNode[];
export declare function cleanup(tokens: Token[]): Token[];
export declare function flatten(tokens: Token[]): Token[];
export declare function getType(token: Token): keyof RenderRules;
export declare function groupText(tokens: Token[]): Token[];
export declare function hasParents(parents: Token[], type: string): boolean;
export declare function stringToTokens(source: string, markdownIt: MarkdownIt): Token[];
export declare function renderInlineAsText(tokens: Token[]): string;
export declare function omitListItemParagraph(tokens: Token[]): Token[];
export declare function splitTextNonTextNodes(children: Token[]): {
    textNodes: Token[];
    nonTextNodes: Token[];
};
