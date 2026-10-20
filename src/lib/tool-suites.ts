/**
 * Tool slug -> suite id, generated from the suite registries by
 * scripts/generate-suite-map.mjs. Used to lazy-load only the suite a tool
 * page needs. Slugs absent here use a standalone calculator or the generic
 * engine.
 */
export type SuiteId = 'pdf' | 'seo' | 'dev' | 'image' | 'media' | 'ai' | 'social' | 'student';

export const TOOL_SUITE_MAP: Record<string, SuiteId> = {
 "merge-pdf": "pdf",
 "split-pdf": "pdf",
 "rotate-pdf": "pdf",
 "organize-pdf": "pdf",
 "crop-pdf": "pdf",
 "page-numbers-pdf": "pdf",
 "watermark-pdf": "pdf",
 "protect-pdf": "pdf",
 "unlock-pdf": "pdf",
 "repair-pdf": "pdf",
 "pdf-to-pdfa": "pdf",
 "pdf-page-counter-inspector": "pdf",
 "compress-pdf": "pdf",
 "pdf-to-word": "pdf",
 "pdf-to-word-converter": "pdf",
 "pdf-to-excel": "pdf",
 "pdf-to-powerpoint": "pdf",
 "pdf-to-markdown": "pdf",
 "pdf-to-jpg": "pdf",
 "jpg-to-pdf": "pdf",
 "word-to-pdf": "pdf",
 "word-to-pdf-converter-safe": "pdf",
 "excel-to-pdf": "pdf",
 "powerpoint-to-pdf": "pdf",
 "html-to-pdf": "pdf",
 "edit-pdf": "pdf",
 "sign-pdf": "pdf",
 "redact-pdf": "pdf",
 "compare-pdf": "pdf",
 "ocr-pdf": "pdf",
 "pdf-forms": "pdf",
 "scan-to-pdf": "pdf",
 "ai-pdf-summarizer": "pdf",
 "translate-pdf": "pdf",
 "delete-pdf-pages": "pdf",
 "extract-pdf-pages": "pdf",
 "alternate-mix-pdf": "pdf",
 "split-pdf-by-bookmarks": "pdf",
 "split-pdf-in-half": "pdf",
 "split-pdf-by-size": "pdf",
 "split-pdf-by-text": "pdf",
 "flatten-pdf": "pdf",
 "bates-numbering-pdf": "pdf",
 "create-bookmarks-pdf": "pdf",
 "edit-pdf-metadata": "pdf",
 "flip-pdf-pages": "pdf",
 "nup-pdf": "pdf",
 "resize-pdf-pages": "pdf",
 "remove-annotations-pdf": "pdf",
 "header-footer-pdf": "pdf",
 "pdf-background": "pdf",
 "extract-pdf-images": "pdf",
 "grayscale-pdf": "pdf",
 "deskew-pdf": "pdf",
 "rename-pdf-by-content": "pdf",
 "pdf-to-epub": "pdf",
 "epub-to-pdf": "pdf",
 "pdf-to-csv": "pdf",
 "pdf-to-tiff": "pdf",
 "tiff-to-pdf": "pdf",
 "pdf-reader": "pdf",
 "pdf-to-text": "pdf",
 "text-to-pdf": "pdf",
 "pdf-to-bmp": "pdf",
 "remove-watermark-pdf": "pdf",
 "png-to-pdf": "pdf",
 "webp-to-pdf": "pdf",
 "gif-to-pdf": "pdf",
 "heic-to-pdf": "pdf",
 "pdf-to-png": "pdf",
 "word-viewer": "pdf",
 "word-editor": "pdf",
 "word-to-jpg": "pdf",
 "word-to-html": "pdf",
 "word-to-text": "pdf",
 "word-to-markdown": "pdf",
 "word-to-epub": "pdf",
 "word-to-odt": "pdf",
 "odt-to-word": "pdf",
 "text-to-word": "pdf",
 "merge-word": "pdf",
 "split-word": "pdf",
 "extract-word-images": "pdf",
 "word-analyzer": "pdf",
 "word-metadata-editor": "pdf",
 "unlock-word": "pdf",
 "protect-word": "pdf",
 "word-watermark": "pdf",
 "compress-word": "pdf",
 "repair-word": "pdf",
 "compare-word": "pdf",
 "word-find-replace": "pdf",
 "meta-tag-generator": "seo",
 "open-graph-generator": "seo",
 "robots-txt-generator": "seo",
 "xml-sitemap-generator": "seo",
 "schema-generator": "seo",
 "faq-schema-generator": "seo",
 "htaccess-redirect-generator": "seo",
 "hreflang-generator": "seo",
 "utm-builder": "seo",
 "llms-txt-generator": "seo",
 "meta-tag-analyzer": "seo",
 "on-page-seo-analyzer": "seo",
 "keyword-density-checker": "seo",
 "readability-checker": "seo",
 "headline-analyzer": "seo",
 "serp-snippet-preview": "seo",
 "code-to-text-ratio-checker": "seo",
 "duplicate-content-checker": "seo",
 "heading-structure-checker": "seo",
 "link-extractor": "seo",
 "robots-txt-tester": "seo",
 "sitemap-validator": "seo",
 "redirect-chain-analyzer": "seo",
 "keyword-clustering": "seo",
 "keyword-combiner": "seo",
 "seo-roi-calculator": "seo",
 "code-minifier": "seo",
 "json-formatter": "dev",
 "json-to-csv-converter": "dev",
 "csv-to-json-converter": "dev",
 "json-to-yaml-converter": "dev",
 "yaml-to-json-converter": "dev",
 "json-to-typescript": "dev",
 "json-diff-checker": "dev",
 "xml-formatter": "dev",
 "sql-formatter": "dev",
 "jwt-decoder": "dev",
 "base64-encoder-decoder": "dev",
 "url-encoder-decoder": "dev",
 "html-entity-encoder-decoder": "dev",
 "hash-generator": "dev",
 "password-generator": "dev",
 "uuid-generator": "dev",
 "timestamp-converter": "dev",
 "cron-expression-parser": "dev",
 "regex-tester": "dev",
 "color-converter": "dev",
 "css-gradient-generator": "dev",
 "number-base-converter": "dev",
 "url-parser": "dev",
 "text-diff-checker": "dev",
 "http-status-code-reference": "dev",
 "chmod-calculator": "dev",
 "user-agent-parser": "dev",
 "background-remover": "image",
 "image-background-changer": "image",
 "qr-code-generator": "image",
 "qr-code-scanner": "image",
 "meme-generator": "image",
 "image-to-text-ocr": "image",
 "passport-photo-maker": "image",
 "favicon-generator": "image",
 "image-watermark": "image",
 "color-palette-extractor": "image",
 "profile-picture-maker": "image",
 "image-collage-maker": "image",
 "image-splitter": "image",
 "image-color-picker": "image",
 "photo-filter-editor": "image",
 "svg-to-png-converter": "image",
 "image-to-ascii-art": "image",
 "image-base64-encoder": "image",
 "video-to-gif": "media",
 "video-compressor": "media",
 "video-trimmer": "media",
 "video-converter": "media",
 "video-to-mp3": "media",
 "video-frame-capture": "media",
 "audio-converter": "media",
 "audio-trimmer": "media",
 "audio-joiner": "media",
 "audio-volume-booster": "media",
 "audio-speed-changer": "media",
 "screen-recorder": "media",
 "webcam-recorder": "media",
 "voice-recorder": "media",
 "text-to-speech": "media",
 "speech-to-text": "media",
 "ai-writer": "ai",
 "ai-paraphraser": "ai",
 "ai-grammar-checker": "ai",
 "ai-text-summarizer": "ai",
 "ai-translator": "ai",
 "ai-story-generator": "ai",
 "ai-poem-generator": "ai",
 "ai-image-generator": "ai",
 "ai-email-writer": "ai",
 "ai-cover-letter-generator": "ai",
 "ai-bio-generator": "ai",
 "ai-caption-generator": "ai",
 "ai-business-name-generator": "ai",
 "ai-chat": "ai",
 "social-image-resizer": "social",
 "youtube-thumbnail-maker": "social",
 "fancy-text-generator": "social",
 "social-post-composer": "social",
 "hashtag-generator": "social",
 "hashtag-counter": "social",
 "engagement-rate-calculator": "social",
 "username-generator": "social",
 "social-video-resizer": "social",
 "post-ideas-generator": "social",
 "giveaway-picker": "social",
 "post-card-maker": "social",
 "link-in-bio-builder": "social",
 "emoji-picker": "social",
 "ai-hashtag-generator": "social",
 "ai-hook-generator": "social",
 "gpa-calculator": "student",
 "citation-generator": "student",
 "essay-word-counter": "student",
 "flashcard-maker": "student",
 "study-planner": "student",
 "periodic-table": "student",
 "equation-solver": "student",
 "ai-quiz-generator": "student",
 "age-calculator": "student",
 "date-calculator": "student",
 "random-number-generator": "student",
 "love-calculator": "student",
 "stopwatch-timer": "student",
 "pomodoro-timer": "student",
 "typing-speed-test": "student",
 "text-to-handwriting": "student"
};

/** PDF/Word slugs load per source-file group so one PDF page stays light. */
export const PDF_SLUG_COMPONENT: Record<string, { group: string; name: string }> = {
 "merge-pdf": {
  "group": "PdfOrganizeTools",
  "name": "MergePdf"
 },
 "split-pdf": {
  "group": "PdfOrganizeTools",
  "name": "SplitPdf"
 },
 "rotate-pdf": {
  "group": "PdfOrganizeTools",
  "name": "RotatePdf"
 },
 "organize-pdf": {
  "group": "PdfOrganizeTools",
  "name": "OrganizePdf"
 },
 "crop-pdf": {
  "group": "PdfOrganizeTools",
  "name": "CropPdf"
 },
 "page-numbers-pdf": {
  "group": "PdfOrganizeTools",
  "name": "PageNumbersPdf"
 },
 "watermark-pdf": {
  "group": "PdfOrganizeTools",
  "name": "WatermarkPdf"
 },
 "protect-pdf": {
  "group": "PdfOrganizeTools",
  "name": "ProtectPdf"
 },
 "unlock-pdf": {
  "group": "PdfOrganizeTools",
  "name": "UnlockPdf"
 },
 "repair-pdf": {
  "group": "PdfOrganizeTools",
  "name": "RepairPdf"
 },
 "pdf-to-pdfa": {
  "group": "PdfOrganizeTools",
  "name": "PdfToPdfA"
 },
 "pdf-page-counter-inspector": {
  "group": "PdfOrganizeTools",
  "name": "PdfPageInspector"
 },
 "compress-pdf": {
  "group": "PdfConvertTools",
  "name": "CompressPdf"
 },
 "pdf-to-word": {
  "group": "PdfConvertTools",
  "name": "PdfToWordPro"
 },
 "pdf-to-word-converter": {
  "group": "PdfConvertTools",
  "name": "PdfToWordPro"
 },
 "pdf-to-excel": {
  "group": "PdfConvertTools",
  "name": "PdfToExcel"
 },
 "pdf-to-powerpoint": {
  "group": "PdfConvertTools",
  "name": "PdfToPowerPoint"
 },
 "pdf-to-markdown": {
  "group": "PdfConvertTools",
  "name": "PdfToMarkdown"
 },
 "pdf-to-jpg": {
  "group": "PdfConvertTools",
  "name": "PdfToJpg"
 },
 "jpg-to-pdf": {
  "group": "PdfConvertTools",
  "name": "JpgToPdf"
 },
 "word-to-pdf": {
  "group": "PdfConvertTools",
  "name": "WordToPdf"
 },
 "word-to-pdf-converter-safe": {
  "group": "PdfConvertTools",
  "name": "WordToPdf"
 },
 "excel-to-pdf": {
  "group": "PdfConvertTools",
  "name": "ExcelToPdf"
 },
 "powerpoint-to-pdf": {
  "group": "PdfConvertTools",
  "name": "PowerPointToPdf"
 },
 "html-to-pdf": {
  "group": "PdfConvertTools",
  "name": "HtmlToPdf"
 },
 "edit-pdf": {
  "group": "PdfInteractiveTools",
  "name": "EditPdf"
 },
 "sign-pdf": {
  "group": "PdfInteractiveTools",
  "name": "SignPdf"
 },
 "redact-pdf": {
  "group": "PdfInteractiveTools",
  "name": "RedactPdf"
 },
 "compare-pdf": {
  "group": "PdfInteractiveTools",
  "name": "ComparePdf"
 },
 "ocr-pdf": {
  "group": "PdfInteractiveTools",
  "name": "OcrPdf"
 },
 "pdf-forms": {
  "group": "PdfInteractiveTools",
  "name": "PdfFormsTool"
 },
 "scan-to-pdf": {
  "group": "PdfInteractiveTools",
  "name": "ScanToPdf"
 },
 "ai-pdf-summarizer": {
  "group": "PdfInteractiveTools",
  "name": "AiSummarizePdf"
 },
 "translate-pdf": {
  "group": "PdfInteractiveTools",
  "name": "TranslatePdf"
 },
 "delete-pdf-pages": {
  "group": "PdfCompetitorToolsA",
  "name": "DeletePdfPages"
 },
 "extract-pdf-pages": {
  "group": "PdfCompetitorToolsA",
  "name": "ExtractPdfPages"
 },
 "alternate-mix-pdf": {
  "group": "PdfCompetitorToolsA",
  "name": "AlternateMixPdf"
 },
 "split-pdf-by-bookmarks": {
  "group": "PdfCompetitorToolsA",
  "name": "SplitByBookmarks"
 },
 "split-pdf-in-half": {
  "group": "PdfCompetitorToolsA",
  "name": "SplitInHalf"
 },
 "split-pdf-by-size": {
  "group": "PdfCompetitorToolsA",
  "name": "SplitBySize"
 },
 "split-pdf-by-text": {
  "group": "PdfCompetitorToolsA",
  "name": "SplitByText"
 },
 "flatten-pdf": {
  "group": "PdfCompetitorToolsA",
  "name": "FlattenPdf"
 },
 "bates-numbering-pdf": {
  "group": "PdfCompetitorToolsA",
  "name": "BatesNumbering"
 },
 "create-bookmarks-pdf": {
  "group": "PdfCompetitorToolsA",
  "name": "CreateBookmarks"
 },
 "edit-pdf-metadata": {
  "group": "PdfCompetitorToolsA",
  "name": "EditMetadata"
 },
 "flip-pdf-pages": {
  "group": "PdfCompetitorToolsA",
  "name": "FlipPdfPages"
 },
 "nup-pdf": {
  "group": "PdfCompetitorToolsA",
  "name": "NupPdf"
 },
 "resize-pdf-pages": {
  "group": "PdfCompetitorToolsA",
  "name": "ResizePdfPages"
 },
 "remove-annotations-pdf": {
  "group": "PdfCompetitorToolsA",
  "name": "RemoveAnnotations"
 },
 "header-footer-pdf": {
  "group": "PdfCompetitorToolsA",
  "name": "HeaderFooterPdf"
 },
 "pdf-background": {
  "group": "PdfCompetitorToolsA",
  "name": "PdfBackground"
 },
 "extract-pdf-images": {
  "group": "PdfCompetitorToolsB",
  "name": "ExtractPdfImages"
 },
 "grayscale-pdf": {
  "group": "PdfCompetitorToolsB",
  "name": "GrayscalePdf"
 },
 "deskew-pdf": {
  "group": "PdfCompetitorToolsB",
  "name": "DeskewPdf"
 },
 "rename-pdf-by-content": {
  "group": "PdfCompetitorToolsB",
  "name": "RenamePdf"
 },
 "pdf-to-epub": {
  "group": "PdfCompetitorToolsB",
  "name": "PdfToEpub"
 },
 "epub-to-pdf": {
  "group": "PdfCompetitorToolsB",
  "name": "EpubToPdf"
 },
 "pdf-to-csv": {
  "group": "PdfCompetitorToolsB",
  "name": "PdfToCsv"
 },
 "pdf-to-tiff": {
  "group": "PdfCompetitorToolsB",
  "name": "PdfToTiff"
 },
 "tiff-to-pdf": {
  "group": "PdfCompetitorToolsB",
  "name": "TiffToPdf"
 },
 "pdf-reader": {
  "group": "PdfCompetitorToolsB",
  "name": "PdfReader"
 },
 "pdf-to-text": {
  "group": "PdfCompetitorToolsB",
  "name": "PdfToText"
 },
 "text-to-pdf": {
  "group": "PdfCompetitorToolsB",
  "name": "TextToPdf"
 },
 "pdf-to-bmp": {
  "group": "PdfCompetitorToolsB",
  "name": "PdfToBmp"
 },
 "remove-watermark-pdf": {
  "group": "PdfCompetitorToolsB",
  "name": "CoverWatermark"
 },
 "png-to-pdf": {
  "group": "PdfConvertTools",
  "name": "JpgToPdf"
 },
 "webp-to-pdf": {
  "group": "PdfConvertTools",
  "name": "JpgToPdf"
 },
 "gif-to-pdf": {
  "group": "PdfConvertTools",
  "name": "JpgToPdf"
 },
 "heic-to-pdf": {
  "group": "PdfConvertTools",
  "name": "JpgToPdf"
 },
 "pdf-to-png": {
  "group": "PdfConvertTools",
  "name": "PdfToJpg"
 },
 "word-viewer": {
  "group": "WordToolsA",
  "name": "WordViewer"
 },
 "word-editor": {
  "group": "WordToolsA",
  "name": "WordEditor"
 },
 "word-to-jpg": {
  "group": "WordToolsA",
  "name": "WordToImages"
 },
 "word-to-html": {
  "group": "WordToolsA",
  "name": "WordToHtml"
 },
 "word-to-text": {
  "group": "WordToolsA",
  "name": "WordToText"
 },
 "word-to-markdown": {
  "group": "WordToolsA",
  "name": "WordToMarkdown"
 },
 "word-to-epub": {
  "group": "WordToolsA",
  "name": "WordToEpub"
 },
 "word-to-odt": {
  "group": "WordToolsA",
  "name": "WordToOdt"
 },
 "odt-to-word": {
  "group": "WordToolsA",
  "name": "OdtToWord"
 },
 "text-to-word": {
  "group": "WordToolsA",
  "name": "TextToWord"
 },
 "merge-word": {
  "group": "WordToolsB",
  "name": "MergeWord"
 },
 "split-word": {
  "group": "WordToolsB",
  "name": "SplitWord"
 },
 "extract-word-images": {
  "group": "WordToolsB",
  "name": "ExtractWordImages"
 },
 "word-analyzer": {
  "group": "WordToolsB",
  "name": "WordAnalyzer"
 },
 "word-metadata-editor": {
  "group": "WordToolsB",
  "name": "WordMetadataEditor"
 },
 "unlock-word": {
  "group": "WordToolsB",
  "name": "UnlockWord"
 },
 "protect-word": {
  "group": "WordToolsB",
  "name": "ProtectWord"
 },
 "word-watermark": {
  "group": "WordToolsB",
  "name": "WordWatermark"
 },
 "compress-word": {
  "group": "WordToolsB",
  "name": "CompressWord"
 },
 "repair-word": {
  "group": "WordToolsB",
  "name": "RepairWord"
 },
 "compare-word": {
  "group": "WordToolsB",
  "name": "CompareWord"
 },
 "word-find-replace": {
  "group": "WordToolsB",
  "name": "WordFindReplace"
 }
};
