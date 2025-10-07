import { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { ASTNode, RenderRules, RenderNodeFunction, RenderLinkFunction, RenderImageFunction } from './types';
export default class AstRenderer {
    private _renderRules;
    private _style;
    private _onLinkPress;
    private _maxTopLevelChildren?;
    private _topLevelMaxExceededItem;
    private _allowedImageHandlers;
    private _defaultImageHandler;
    private _debugPrintTree;
    constructor(_renderRules: RenderRules, _style: Record<string, StyleProp<TextStyle | ViewStyle | ImageStyle>>, _onLinkPress: ((url: string) => boolean) | undefined, _maxTopLevelChildren?: number | undefined, _topLevelMaxExceededItem?: ReactNode, _allowedImageHandlers?: string[], _defaultImageHandler?: string, _debugPrintTree?: boolean);
    getRenderFunction: (type: keyof RenderRules) => RenderNodeFunction | RenderLinkFunction | RenderImageFunction;
    renderNode: (node: ASTNode, parents: ASTNode[], isRoot?: boolean) => ReactNode;
    render: (nodes: ASTNode[]) => ReactNode;
}
