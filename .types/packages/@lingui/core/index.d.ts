import { CompiledMessage } from '@lingui/message-utils/compileMessage';

declare class EventEmitter<Events extends {
    [name: string]: (...args: any[]) => any;
}> {
    private readonly _events;
    on(event: keyof Events, listener: Events[typeof event]): () => void;
    removeListener(event: keyof Events, listener: Events[typeof event]): void;
    emit(event: keyof Events, ...args: Parameters<Events[typeof event]>): void;
    private _getListeners;
}

type MessageOptions = {
    message?: string;
    formats?: Formats;
    comment?: string;
};

type Locale = string;
type Locales = Locale | Locale[];
type Formats = Record<string, Intl.DateTimeFormatOptions | Intl.NumberFormatOptions>;
type Values = Record<string, unknown>;
/**
 * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
 */
type LocaleData = {
    plurals?: (n: number, ordinal?: boolean) => ReturnType<Intl.PluralRules["select"]>;
};
/**
 * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
 */
type AllLocaleData = Record<Locale, LocaleData>;
type UncompiledMessage = string;
type Messages = Record<string, UncompiledMessage | CompiledMessage>;
type AllMessages = Record<Locale, Messages>;
type MessageDescriptor = {
    id: string;
    comment?: string;
    message?: string;
    values?: Record<string, unknown>;
};
type MissingMessageEvent = {
    locale: Locale;
    id: string;
};
type MissingHandler = string | ((locale: string, id: string) => string);
type I18nProps = {
    locale?: Locale;
    locales?: Locales;
    messages?: AllMessages;
    /**
     * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
     */
    localeData?: AllLocaleData;
    missing?: MissingHandler;
};
type Events = {
    change: () => void;
    missing: (event: MissingMessageEvent) => void;
};
type LoadAndActivateOptions = {
    /** initial active locale */
    locale: Locale;
    /** list of alternative locales (BCP 47 language tags) which are used for number and date formatting */
    locales?: Locales;
    /** compiled message catalog */
    messages: Messages;
};
type MessageCompiler = (message: string) => CompiledMessage;
declare class I18n extends EventEmitter<Events> {
    private _locale;
    private _locales?;
    private _localeData;
    private _messages;
    private _missing?;
    private _messageCompiler?;
    constructor(params: I18nProps);
    get locale(): string;
    get locales(): Locales | undefined;
    get messages(): Messages;
    /**
     * @deprecated this has no effect. Please remove this from the code. Deprecated in v4
     */
    get localeData(): LocaleData;
    private _loadLocaleData;
    /**
     * Registers a `MessageCompiler` to enable the use of uncompiled catalogs at runtime.
     *
     * In production builds, the `MessageCompiler` is typically excluded to reduce bundle size.
     * By default, message catalogs should be precompiled during the build process. However,
     * if you need to compile catalogs at runtime, you can use this method to set a message compiler.
     *
     * Example usage:
     *
     * ```ts
     * import { compileMessage } from "@lingui/message-utils/compileMessage";
     *
     * i18n.setMessagesCompiler(compileMessage);
     * ```
     */
    setMessagesCompiler(compiler: MessageCompiler): this;
    /**
     * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
     */
    loadLocaleData(allLocaleData: AllLocaleData): void;
    /**
     * @deprecated Plurals automatically used from Intl.PluralRules you can safely remove this call. Deprecated in v4
     */
    loadLocaleData(locale: Locale, localeData: LocaleData): void;
    private _load;
    load(allMessages: AllMessages): void;
    load(locale: Locale, messages: Messages): void;
    /**
     * @param options {@link LoadAndActivateOptions}
     */
    loadAndActivate({ locale, locales, messages }: LoadAndActivateOptions): void;
    activate(locale: Locale, locales?: Locales): void;
    _(descriptor: MessageDescriptor): string;
    _(id: string, values?: Values, options?: MessageOptions): string;
    /**
     * Alias for {@see I18n._}
     */
    t: I18n["_"];
    date(value: string | Date, format?: Intl.DateTimeFormatOptions): string;
    number(value: number, format?: Intl.NumberFormatOptions): string;
}
declare function setupI18n(params?: I18nProps): I18n;

declare const defaultLocale = "en";
type DateTimeFormatSize = "short" | "default" | "long" | "full";
declare function date(locales: Locales, value: string | Date, format?: Intl.DateTimeFormatOptions | DateTimeFormatSize): string;
declare function time(locales: Locales, value: string | Date, format?: Intl.DateTimeFormatOptions | DateTimeFormatSize): string;
declare function number(locales: Locales, value: number, format?: Intl.NumberFormatOptions): string;
type PluralOptions = {
    [key: string]: Intl.LDMLPluralRule;
} & {
    offset: number;
    other: string;
};
declare function plural(locales: Locales, ordinal: boolean, value: number, { offset, ...rules }: PluralOptions): string;

type formats_DateTimeFormatSize = DateTimeFormatSize;
type formats_PluralOptions = PluralOptions;
declare const formats_date: typeof date;
declare const formats_defaultLocale: typeof defaultLocale;
declare const formats_number: typeof number;
declare const formats_plural: typeof plural;
declare const formats_time: typeof time;
declare namespace formats {
  export { type formats_DateTimeFormatSize as DateTimeFormatSize, type formats_PluralOptions as PluralOptions, formats_date as date, formats_defaultLocale as defaultLocale, formats_number as number, formats_plural as plural, formats_time as time };
}

declare const i18n: I18n;

export { type AllLocaleData, type AllMessages, I18n, type Locale, type LocaleData, type Locales, type MessageDescriptor, type MessageOptions, type Messages, formats, i18n, setupI18n };
