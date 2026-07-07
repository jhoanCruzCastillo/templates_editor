// Tipos mínimos para librerías de previsualización de Excel (solo lectura)

declare module 'luckyexcel' {
  interface LuckyExcelStatic {
    transformExcelToLucky(
      data: ArrayBuffer | File,
      onSuccess: (exportJson: { sheets?: unknown[]; info?: unknown }) => void,
      onError?: (err: unknown) => void,
    ): void;
  }
  const LuckyExcel: LuckyExcelStatic;
  export default LuckyExcel;
}

// Luckysheet se carga como script UMD global desde /vendor/luckysheet
interface Window {
  luckysheet?: {
    create(options: Record<string, unknown>): void;
    destroy(): void;
  };
}
