import { b as I18nContext } from './shared/react.34bf68ab.js';
export { e as TransNoContext, T as TransProps, d as TransRenderCallbackOrComponent, c as TransRenderProps } from './shared/react.34bf68ab.js';
import { I18n } from '@lingui/core';
import 'react';

/**
 * This is an entry point for React Server Components (RSC)
 *
 * RSC uses static analysis to find any non-valid function calls in the import graph.
 * That means this entry point and its children must not have any Provider/Context calls.
 */

/**
 * Set Lingui's i18n instance for later use in RSC Components
 *
 * Example:
 *
 * ```js
 * import { setupI18n } from "@lingui/core";
 *
 * const i18n = setupI18n({
 *   locale,
 *   messages: { [locale]: messages },
 * })
 *
 * setI18n(i18n);
 * ```
 */
declare function setI18n(i18n: I18n, defaultComponent?: I18nContext["defaultComponent"]): void;
/**
 * Get Lingui's i18n instance saved for RSC
 *
 * ```js
 * export function generateMetadata() {
 *   const i18n = getI18n()
 *
 *   return {
 *     title: t(i18n)`Translation Demo`,
 *   }
 * }
 * ```
 */
declare function getI18n(): I18nContext | null;

export { getI18n, setI18n };
