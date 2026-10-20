// ============================================================
// SUPER CROWN TOOLS — Word (.docx) engine
// Shared helpers for the Word Tools suite: mammoth conversion,
// an HTML -> docx paragraph walker, and docx zip/XML surgery.
// A .docx is a zip of XML parts; JSZip + string/XML edits cover
// metadata, protection, media, and structure tools honestly.
// ============================================================

import mammoth from 'mammoth';
import JSZip from 'jszip';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { fileToBytes, downloadBytes, downloadBlob } from '../pdf/core';

export { fileToBytes, downloadBytes, downloadBlob };

export function stripFileExt(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
export { JSZip };

export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function downloadDocx(bytes: Uint8Array, filename: string) {
  downloadBytes(bytes, filename, DOCX_MIME);
}

// ---------------- mammoth conversions ----------------

export async function docxToHtml(file: File | Blob | ArrayBuffer): Promise<string> {
  const arrayBuffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

export async function docxToText(file: File | Blob | ArrayBuffer): Promise<string> {
  const arrayBuffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ---------------- docx zip helpers ----------------

export async function loadDocxZip(file: File | Blob | ArrayBuffer): Promise<JSZip> {
  const data = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
  return JSZip.loadAsync(data);
}

export async function saveDocxZip(zip: JSZip): Promise<Uint8Array> {
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 9 } });
}

export async function getZipText(zip: JSZip, path: string): Promise<string | null> {
  const entry = zip.file(path);
  if (!entry) return null;
  return entry.async('string');
}

export function setZipText(zip: JSZip, path: string, text: string) {
  zip.file(path, text);
}

export function parseXml(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'application/xml');
}

export function serializeXml(doc: Document): string {
  return new XMLSerializer().serializeToString(doc);
}

// ---------------- HTML -> docx ----------------

interface InlineState {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  link?: boolean;
}

function runsFromNode(node: Node, state: InlineState, out: TextRun[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (text) {
      out.push(
        new TextRun({
          text,
          bold: state.bold,
          italics: state.italics,
          underline: state.underline ? {} : undefined,
          strike: state.strike,
          font: state.code ? 'Consolas' : undefined,
          color: state.link ? '0563C1' : undefined,
        })
      );
    }
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (tag === 'br') {
    out.push(new TextRun({ break: 1 }));
    return;
  }
  const next: InlineState = { ...state };
  if (tag === 'strong' || tag === 'b') next.bold = true;
  if (tag === 'em' || tag === 'i') next.italics = true;
  if (tag === 'u') next.underline = true;
  if (tag === 's' || tag === 'strike' || tag === 'del') next.strike = true;
  if (tag === 'code') next.code = true;
  if (tag === 'a') {
    next.underline = true;
    next.link = true;
  }
  const style = el.getAttribute('style') || '';
  if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) next.bold = true;
  if (/font-style\s*:\s*italic/i.test(style)) next.italics = true;
  el.childNodes.forEach((child) => runsFromNode(child, next, out));
}

function paragraphAlignment(el: HTMLElement): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  const align = (el.getAttribute('align') || el.style?.textAlign || '').toLowerCase();
  if (align === 'center') return AlignmentType.CENTER;
  if (align === 'right') return AlignmentType.RIGHT;
  if (align === 'justify') return AlignmentType.JUSTIFIED;
  return undefined;
}

const HEADING_LEVELS: Record<string, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  h1: HeadingLevel.HEADING_1,
  h2: HeadingLevel.HEADING_2,
  h3: HeadingLevel.HEADING_3,
  h4: HeadingLevel.HEADING_4,
  h5: HeadingLevel.HEADING_5,
  h6: HeadingLevel.HEADING_6,
};

/** Convert mammoth-style HTML into docx paragraphs (headings, paragraphs,
 * lists, quotes, code blocks, simple tables). Images are skipped. */
export function htmlToDocxParagraphs(html: string): Paragraph[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const paragraphs: Paragraph[] = [];

  const walkBlock = (el: HTMLElement) => {
    const tag = el.tagName.toLowerCase();
    if (HEADING_LEVELS[tag]) {
      const runs: TextRun[] = [];
      el.childNodes.forEach((c) => runsFromNode(c, {}, runs));
      paragraphs.push(new Paragraph({ heading: HEADING_LEVELS[tag], children: runs, spacing: { before: 240, after: 120 } }));
      return;
    }
    if (tag === 'p') {
      const runs: TextRun[] = [];
      el.childNodes.forEach((c) => runsFromNode(c, {}, runs));
      paragraphs.push(new Paragraph({ children: runs, alignment: paragraphAlignment(el), spacing: { after: 120 } }));
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      let idx = 0;
      el.querySelectorAll(':scope > li').forEach((li) => {
        idx++;
        const runs: TextRun[] = [new TextRun({ text: tag === 'ol' ? `${idx}. ` : '• ' })];
        li.childNodes.forEach((c) => runsFromNode(c, {}, runs));
        paragraphs.push(new Paragraph({ children: runs, spacing: { after: 60 }, indent: { left: 360 } }));
      });
      return;
    }
    if (tag === 'blockquote') {
      const runs: TextRun[] = [];
      el.childNodes.forEach((c) => runsFromNode(c, { italics: true }, runs));
      paragraphs.push(new Paragraph({ children: runs, indent: { left: 480 }, spacing: { after: 120 } }));
      return;
    }
    if (tag === 'pre') {
      paragraphs.push(
        new Paragraph({ children: [new TextRun({ text: el.textContent || '', font: 'Consolas', size: 18 })], spacing: { after: 120 } })
      );
      return;
    }
    if (tag === 'table') {
      el.querySelectorAll('tr').forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll('th,td')).map((c) => (c.textContent || '').trim());
        if (cells.length) {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: cells.join('  |  ') })], spacing: { after: 60 } }));
        }
      });
      return;
    }
    if (tag === 'hr') {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: '────────────────────────' })], spacing: { after: 120 } }));
      return;
    }
    // Containers and unknown blocks: recurse into element children;
    // stray inline content becomes its own paragraph.
    const inlineRuns: TextRun[] = [];
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && /^(div|section|article|main|header|footer)$/i.test((child as HTMLElement).tagName)) {
        if (inlineRuns.length) {
          paragraphs.push(new Paragraph({ children: inlineRuns.splice(0), spacing: { after: 120 } }));
        }
        walkBlock(child as HTMLElement);
      } else if (child.nodeType === Node.ELEMENT_NODE && /^(h[1-6]|p|ul|ol|blockquote|pre|table|hr)$/i.test((child as HTMLElement).tagName)) {
        if (inlineRuns.length) {
          paragraphs.push(new Paragraph({ children: inlineRuns.splice(0), spacing: { after: 120 } }));
        }
        walkBlock(child as HTMLElement);
      } else {
        runsFromNode(child, {}, inlineRuns);
      }
    });
    if (inlineRuns.length) paragraphs.push(new Paragraph({ children: inlineRuns, spacing: { after: 120 } }));
  };

  Array.from(doc.body.children).forEach((child) => walkBlock(child as HTMLElement));
  if (paragraphs.length === 0) {
    const text = doc.body.textContent?.trim();
    if (text) paragraphs.push(new Paragraph({ children: [new TextRun({ text })] }));
  }
  return paragraphs;
}

export async function htmlToDocxBytes(html: string, title?: string): Promise<Uint8Array> {
  const doc = new DocxDocument({
    title,
    sections: [{ properties: {}, children: htmlToDocxParagraphs(html) }],
  });
  const blob = await Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}

export async function textToDocxBytes(text: string, title?: string): Promise<Uint8Array> {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        new Paragraph({
          children: block.split('\n').flatMap((line, i) =>
            i === 0 ? [new TextRun({ text: line })] : [new TextRun({ break: 1 }), new TextRun({ text: line })]
          ),
          spacing: { after: 120 },
        })
    );
  const doc = new DocxDocument({ title, sections: [{ properties: {}, children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}
