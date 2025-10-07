import { TextStyle } from 'react-native';
import { PropsWithChildren } from 'react';
import { BundledLanguage, BundledTheme } from 'shiki';
export interface CodeProps {
    lang?: CodeLanguages;
    theme?: CodeThemes;
    children: string;
}
export type CodeThemes = BundledTheme;
export type CodeLanguages = BundledLanguage | 'ansi' | 'text';
export type CodeTextProps = PropsWithChildren<{
    style?: TextStyle;
}>;
