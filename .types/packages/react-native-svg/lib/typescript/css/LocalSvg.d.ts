import * as React from 'react';
import { Component } from 'react';
import { type ImageSourcePropType } from 'react-native';
import { type SvgProps } from 'react-native-svg';
export declare function getUriFromSource(source: ImageSourcePropType): string | undefined;
export declare function loadLocalRawResourceDefault(source: ImageSourcePropType): Promise<string | null>;
export declare function isUriAnAndroidResourceIdentifier(uri?: string): boolean;
export declare function loadAndroidRawResource(uri: string): Promise<any>;
export declare function loadLocalRawResourceAndroid(source: ImageSourcePropType): Promise<any>;
export declare const loadLocalRawResource: typeof loadLocalRawResourceAndroid;
export type LocalProps = SvgProps & {
    asset: ImageSourcePropType;
    override?: object;
};
export type LocalState = {
    xml: string | null;
};
export declare function LocalSvg(props: LocalProps): React.JSX.Element;
export declare class WithLocalSvg extends Component<LocalProps, LocalState> {
    state: {
        xml: null;
    };
    componentDidMount(): void;
    componentDidUpdate(prevProps: {
        asset: ImageSourcePropType;
    }): void;
    load(asset: ImageSourcePropType): Promise<void>;
    render(): React.JSX.Element;
}
export default LocalSvg;
//# sourceMappingURL=LocalSvg.d.ts.map