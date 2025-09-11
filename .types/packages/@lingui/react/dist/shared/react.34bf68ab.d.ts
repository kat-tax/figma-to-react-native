import React, { ComponentType } from 'react';
import { MessageOptions, I18n } from '@lingui/core';

type TransRenderProps = {
    id: string;
    translation: React.ReactNode;
    children: React.ReactNode;
    message?: string | null;
};
type TransRenderCallbackOrComponent = {
    component?: undefined;
    render?: ((props: TransRenderProps) => React.ReactElement<any, any>) | null;
} | {
    component?: React.ComponentType<TransRenderProps> | null;
    render?: undefined;
};
type TransProps = {
    id: string;
    message?: string;
    values?: Record<string, unknown>;
    components?: {
        [key: string]: React.ElementType | any;
    };
    formats?: MessageOptions["formats"];
    comment?: string;
} & TransRenderCallbackOrComponent;
/**
 * Version of `<Trans>` component without using a Provider/Context React feature.
 * Primarily made for support React Server Components (RSC)
 *
 * @experimental the api of this component is not stabilized yet.
 */
declare function TransNoContext(props: TransProps & {
    lingui: {
        i18n: I18n;
        defaultComponent?: ComponentType<TransRenderProps>;
    };
}): React.ReactElement<any, any> | null;

type I18nContext = {
    i18n: I18n;
    _: I18n["_"];
    defaultComponent?: ComponentType<TransRenderProps>;
};
type I18nProviderProps = Omit<I18nContext, "_"> & {
    children?: React.ReactNode;
};
declare const LinguiContext: React.Context<I18nContext | null>;
declare function useLingui(): I18nContext;
declare function I18nProvider({ i18n, defaultComponent, children, }: I18nProviderProps): React.JSX.Element | null;

export { I18nProvider as I, LinguiContext as L, type TransProps as T, type I18nProviderProps as a, type I18nContext as b, type TransRenderProps as c, type TransRenderCallbackOrComponent as d, TransNoContext as e, useLingui as u };
