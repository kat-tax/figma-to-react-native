import { NavigateOptions } from 'react-router';
type SetURLSearchParams = (nextInit?: URLSearchParamsInit | undefined, navigateOpts?: NavigateOptions | undefined) => void;
type ParamKeyValuePair = [string, string];
type URLSearchParamsData = [URLSearchParams, SetURLSearchParams];
type URLSearchParamsInit = string | ParamKeyValuePair[] | Record<string, string | string[]> | URLSearchParams;
/**
 * A wrapper for accessing individual query parameters via URLSearchParams.
 */
export declare function useSearchParams(init?: URLSearchParamsInit): URLSearchParamsData;
/**
 * Creates a URLSearchParams object using the given initializer.
 */
export declare function createSearchParams(initParams?: URLSearchParamsInit): URLSearchParams;
export {};
