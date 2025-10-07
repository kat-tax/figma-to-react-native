import { StyleProp, ViewStyle } from 'react-native';
export interface GameProps {
    /** Platform to emulate */
    platform: keyof typeof PLATFORMS;
    /** Url to the rom file */
    url: string;
    /** Name of the game */
    name: string;
    /** Url to the bios file (if required by platform) */
    bios?: string;
    /** Url to the save state file */
    save?: string;
    /** Url to the patch file */
    patch?: string;
    /** Url to the game parent data */
    parent?: string;
    /** Cheats for the game */
    cheats?: string[];
    /** Whether to show the game controls (default: true) */
    controls?: boolean;
    /** Whether the game should use threads (default: false) */
    threads?: boolean;
    /** Whether the game should start on load (default: false) */
    startOnLoaded?: boolean;
    /** Whether the game should start in fullscreen (default: false) */
    fullscreen?: boolean;
    /** Master volume of the game */
    volume?: number;
    /** A locale to set the UI language */
    language?: string;
    /** Hex color for the UI background */
    background?: string;
    /** Whether the background should be blurred (default: false) */
    blur?: boolean;
    /** Hex color for the UI theme */
    accent?: string;
    /** The style of the view container */
    style?: StyleProp<ViewStyle>;
}
export declare const PLATFORMS: {
    readonly atari2600: "Atari 2600";
    readonly atari7800: "Atari 7800";
    readonly jaguar: "Atari Jaguar";
    readonly lynx: "Atari Lynx";
    readonly ws: "Bandai WonderSwan (Color)";
    readonly coleco: "ColecoVision";
    readonly vice_x64: "Commodore 64";
    readonly pcfx: "NEC PC-FX";
    readonly pce: "NEC TurboGrafx-16/SuperGrafx/PC Engine";
    readonly n64: "Nintendo 64";
    readonly nds: "Nintendo DS";
    readonly nes: "Nintendo Entertainment System";
    readonly gba: "Nintendo Game Boy Advance";
    readonly gb: "Nintendo Game Boy";
    readonly psx: "PlayStation";
    readonly sega32x: "Sega 32X";
    readonly segaCD: "Sega CD";
    readonly segaGG: "Sega Game Gear";
    readonly segaMS: "Sega Master System";
    readonly segaMD: "Sega Mega Drive";
    readonly segaSaturn: "Sega Saturn";
    readonly ngp: "SNK NeoGeo Pocket (Color)";
    readonly snes: "Super Nintendo Entertainment System";
    readonly vb: "Virtual Boy";
};
