import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  MergePdf,
  SplitPdf,
  RotatePdf,
  OrganizePdf,
  CropPdf,
  PageNumbersPdf,
  WatermarkPdf,
  ProtectPdf,
  UnlockPdf,
  RepairPdf,
  PdfToPdfA,
  PdfPageInspector,
} from './PdfOrganizeTools';
import {
  CompressPdf,
  PdfToWordPro,
  PdfToExcel,
  PdfToPowerPoint,
  PdfToMarkdown,
  PdfToJpg,
  JpgToPdf,
  WordToPdf,
  ExcelToPdf,
  PowerPointToPdf,
  HtmlToPdf,
} from './PdfConvertTools';
import {
  EditPdf,
  SignPdf,
  RedactPdf,
  ComparePdf,
  OcrPdf,
  PdfFormsTool,
  ScanToPdf,
  AiSummarizePdf,
  TranslatePdf,
} from './PdfInteractiveTools';

export type PdfToolComponent = ComponentType<{ tool: ToolItem }>;

/** Single source of truth: tool slug -> real working component. */
export const PDF_TOOL_COMPONENTS: Record<string, PdfToolComponent> = {
  // Organize / edit / security
  'merge-pdf': MergePdf,
  'split-pdf': SplitPdf,
  'rotate-pdf': RotatePdf,
  'organize-pdf': OrganizePdf,
  'crop-pdf': CropPdf,
  'page-numbers-pdf': PageNumbersPdf,
  'watermark-pdf': WatermarkPdf,
  'protect-pdf': ProtectPdf,
  'unlock-pdf': UnlockPdf,
  'repair-pdf': RepairPdf,
  'pdf-to-pdfa': PdfToPdfA,
  'pdf-page-counter-inspector': PdfPageInspector,
  // Convert
  'compress-pdf': CompressPdf,
  'pdf-to-word': PdfToWordPro,
  'pdf-to-word-converter': PdfToWordPro, // legacy slug now uses the real .docx engine
  'pdf-to-excel': PdfToExcel,
  'pdf-to-powerpoint': PdfToPowerPoint,
  'pdf-to-markdown': PdfToMarkdown,
  'pdf-to-jpg': PdfToJpg,
  'jpg-to-pdf': JpgToPdf,
  'word-to-pdf': WordToPdf,
  'word-to-pdf-converter-safe': WordToPdf, // legacy slug now uses the real converter
  'excel-to-pdf': ExcelToPdf,
  'powerpoint-to-pdf': PowerPointToPdf,
  'html-to-pdf': HtmlToPdf,
  // Interactive / AI
  'edit-pdf': EditPdf,
  'sign-pdf': SignPdf,
  'redact-pdf': RedactPdf,
  'compare-pdf': ComparePdf,
  'ocr-pdf': OcrPdf,
  'pdf-forms': PdfFormsTool,
  'scan-to-pdf': ScanToPdf,
  'ai-pdf-summarizer': AiSummarizePdf,
  'translate-pdf': TranslatePdf,
};
