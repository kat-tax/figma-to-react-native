import { default as MarkdownIt } from 'markdown-it';
import { ReactNode } from 'react';
import { ASTNode } from './types';
export default function parser(source: string | ASTNode[], parser: MarkdownIt, renderer: (node: ASTNode[]) => ReactNode): ReactNode;
