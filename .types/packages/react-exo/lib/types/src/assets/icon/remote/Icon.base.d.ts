export interface IconRemoteProps {
    /** The name of the icon to display */
    name: string;
    /** The size of the icon */
    size?: `${number}%` | number;
    /** The color of the icon */
    color?: string;
}
export declare const ICONIFY_HOST = "https://api.iconify.design";
export declare const getUrl: (name: string) => string;
