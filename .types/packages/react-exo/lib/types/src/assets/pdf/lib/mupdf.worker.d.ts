export declare class MupdfWorker {
    private data?;
    private cache;
    private document?;
    private isRendering;
    private renderQueue;
    constructor();
    private init;
    getPageCount(): number;
    loadDocument(data: ArrayBuffer): boolean;
    reloadDocument(): void;
    renderPageAsImage(index?: number, scale?: number): Promise<Uint8Array>;
    private processRenderQueue;
}
