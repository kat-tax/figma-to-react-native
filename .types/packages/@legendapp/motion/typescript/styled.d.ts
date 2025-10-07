import { Animated, FlatList as RNFlatList, Image as RNImage, PressableProps, ScrollView as RNScrollView, SectionList as RNSectionList, Text as RNText, View as RNView } from 'react-native';
export declare type StyledProps = {
    className?: string;
    tw?: string;
    baseClassName?: string;
    baseTw?: string;
};
export declare namespace Motion {
    const View: <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<import("react-native").ViewProps & import("react").RefAttributes<RNView>> & StyledProps & import("./Interfaces").MotionComponentProps<typeof RNView, import("react-native").ViewStyle, TAnimate, TAnimateProps, unknown>, ref: import("react").Ref<RNView>) => import("react").ReactElement;
    const Text: <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<import("react-native").TextProps & import("react").RefAttributes<RNText>> & StyledProps & import("./Interfaces").MotionComponentProps<typeof RNText, import("react-native").TextStyle, TAnimate, TAnimateProps, unknown>, ref: import("react").Ref<RNText>) => import("react").ReactElement;
    const FlatList: <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<import("react-native").FlatListProps<unknown> & import("react").RefAttributes<RNFlatList<unknown>>> & StyledProps & import("./Interfaces").MotionComponentProps<typeof RNFlatList, import("react-native").ViewStyle, TAnimate, TAnimateProps, unknown>, ref: import("react").Ref<RNFlatList<unknown>>) => import("react").ReactElement;
    const Image: <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<import("react-native").ImageProps & import("react").RefAttributes<RNImage>> & StyledProps & import("./Interfaces").MotionComponentProps<typeof RNImage, import("react-native").ImageStyle, TAnimate, TAnimateProps, unknown>, ref: import("react").Ref<RNImage>) => import("react").ReactElement;
    const ScrollView: <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<import("react-native").ScrollViewProps & import("react").RefAttributes<RNScrollView>> & StyledProps & import("./Interfaces").MotionComponentProps<typeof RNScrollView, import("react-native").ViewStyle, TAnimate, TAnimateProps, unknown>, ref: import("react").Ref<RNScrollView>) => import("react").ReactElement;
    const SectionList: <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<import("react-native").SectionListProps<unknown, unknown> & import("react").RefAttributes<RNSectionList<unknown, unknown>>> & StyledProps & import("./Interfaces").MotionComponentProps<typeof RNSectionList, import("react-native").ViewStyle, TAnimate, TAnimateProps, unknown>, ref: import("react").Ref<RNSectionList<unknown, unknown>>) => import("react").ReactElement;
    const Pressable: (props: PressableProps & StyledProps) => JSX.Element;
}
