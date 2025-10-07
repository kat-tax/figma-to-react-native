import { default as MarkdownIt } from 'markdown-it';
import { StyleSheet } from 'react-native';
import { default as AstRenderer } from './lib/renderer';
import { ReactNode } from 'react';
import { RenderRules } from './lib/types';
export interface MarkdownProps {
    children: string;
    rules?: Partial<RenderRules>;
    style?: StyleSheet.NamedStyles<unknown>;
    renderer?: AstRenderer;
    markdownit?: MarkdownIt;
    mergeStyle?: boolean;
    debugPrintTree?: boolean;
    maxTopLevelChildren?: number;
    topLevelMaxExceededItem?: ReactNode;
    defaultImageHandler?: string;
    allowedImageHandlers?: string[];
    onLinkPress?: (url: string) => boolean;
}
export declare const Markdown: import('react').MemoExoticComponent<(props: MarkdownProps) => ReactNode>;
export default Markdown;
