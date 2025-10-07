import { TrueSheetProps, SheetSize } from '@lodev09/react-native-true-sheet';
import { ReactNode } from 'react';
import { Mappings } from '../../unistyles';
export interface SheetProps extends TrueSheetProps {
    /** Whether the sheet is open (only needed if controlled) */
    open?: boolean;
    /** The title of the sheet */
    title?: string;
    /** The description of the sheet */
    description?: string;
    /** The component to render as the trigger (not needed if controlled with open) */
    trigger?: ReactNode;
    /** The "auto" size will map to this size.
     * @note Temporary property for web only, will be removed when vaul supports "auto" */
    autoWebSize?: number;
    /** The function to call when the open state changes */
    onOpenChange?: (open: boolean) => void;
    /** Override props using Unistyles theme */
    uniProps?: Mappings<Omit<SheetProps, 'uniProps'>>;
}
export interface SheetHandle {
    /** Open the sheet imperatively */
    present: () => Promise<void>;
    /** Close the sheet imperatively */
    dismiss: () => Promise<void>;
}
export declare const DEFAULT_SIZES: SheetSize[];
