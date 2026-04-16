declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }
  interface PDFParseStatic {
    (buffer: Buffer, options?: Record<string, unknown>): Promise<PDFData>;
  }
  const PDFParse: PDFParseStatic;
  export default PDFParse;
}
