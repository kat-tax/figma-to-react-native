import { LegendListRef } from '@legendapp/list';
import { PdfRef } from '../Pdf.interface';
interface PdfProviderProps {
    src: string | ArrayBuffer | Uint8Array;
    ref: React.Ref<PdfRef>;
    children: React.ReactNode;
    onPageChange?: (page: number, totalPages: number) => void;
}
interface PdfContextType {
    renderPage: (index: number) => Promise<Uint8Array | undefined>;
    setCurrentPage: (index: number) => void;
    currentPage: number;
    pageCount: number;
    listRef: React.Ref<LegendListRef>;
}
export declare function usePdf(): PdfContextType;
export declare const PdfProvider: import('react').ForwardRefExoticComponent<Omit<PdfProviderProps, "ref"> & import('react').RefAttributes<PdfRef>>;
export {};
