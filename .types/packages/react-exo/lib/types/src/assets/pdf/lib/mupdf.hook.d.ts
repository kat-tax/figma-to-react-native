export declare function useMupdf(): {
    started: boolean;
    loadDocument: (data: ArrayBuffer) => Promise<false> | Promise<true>;
    getPageCount: () => Promise<number>;
    renderPage: (index: number) => Promise<Uint8Array<ArrayBufferLike>>;
};
