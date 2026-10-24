import React, { useState } from 'react';
import { FileText, Download, Copy, Check, UploadCloud, FileCode, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLang, useStrings, COMMON } from '../../lib/LangContext';
import { CALC_STRINGS } from '../../lib/strings/calculators';

export const PdfToWordConverter: React.FC = () => {
  const lang = useLang();
  const s = useStrings(CALC_STRINGS);
  const c = useStrings(COMMON);
  const [extractedText, setExtractedText] = useState<string>(
    `CONSULTING SERVICES AGREEMENT (USA STANDARD)

This Agreement is entered into by and between Super Crown Global ("Client") and the Service Provider ("Consultant").

1. SCOPE OF SERVICES
The Consultant shall perform high-level architectural design, system optimization, and technical performance audits for the Client. All deliverables shall be completed in a professional manner adhering to industry best practices.

2. COMPENSATION & PAYMENT TERMS
The Client shall remit payment within 30 days of receiving a verified monthly invoice. All payments shall be made in United States Dollars ($ USD) via direct electronic transfer.

3. CONFIDENTIALITY & PROPRIETARY RIGHTS
All source code, proprietary algorithms, financial documentation, and internal data remain the exclusive property of the Client. The Consultant shall not disclose any sensitive trade secrets to third parties without prior written consent.

4. GOVERNING LAW
This Agreement shall be interpreted and governed in accordance with the laws of the State of Delaware, United States.`
  );

  const [documentTitle, setDocumentTitle] = useState('Consulting_Agreement_Editable');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('Sample_Document.pdf');

  // Metrics
  const wordsCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charsCount = extractedText.length;
  const readingTimeMin = Math.ceil(wordsCount / 200);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Clean and extract readable string lines
        const cleanContent = content
          .replace(/[^\x20-\x7E\t\r\n]/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();

        if (cleanContent.length > 50) {
          setExtractedText(cleanContent);
        } else {
          setExtractedText(
            `${s('extractedFrom').replace('{name}', file.name)}\n\n` +
            `${s('docHeaderLine').replace('{name}', file.name.toUpperCase())}\n` +
            `${s('fileSizeLine').replace('{size}', (file.size / 1024).toFixed(1))}\n` +
            `${s('timestampLine').replace('{date}', new Date().toLocaleDateString(lang))}\n\n` +
            `${s('summaryHeading')}\n` +
            `${s('summaryText')}`
          );
        }
        setIsProcessing(false);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadWordDoc = () => {
    // Generate valid Microsoft Word HTML formatted blob
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${documentTitle}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
          h1 { font-size: 16pt; font-weight: bold; margin-bottom: 12pt; }
          p { margin-bottom: 10pt; }
        </style>
      </head>
      <body>
        ${extractedText
          .split('\n\n')
          .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📄</span> {s('pdfTitle')}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {s('pdfSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? c('copied') : s('copyText')}</span>
          </button>
          <button
            onClick={handleDownloadWordDoc}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#f97316] text-white hover:bg-orange-600 shadow-md cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{s('downloadDocBtn')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload and Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* File Upload Box */}
          <label className="block border-2 border-dashed border-orange-300 dark:border-orange-800 hover:border-orange-500 rounded-2xl p-6 text-center bg-orange-50/40 dark:bg-orange-950/20 cursor-pointer transition-all">
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-orange-500 mx-auto mb-2" />
            <span className="text-xs font-bold text-gray-900 dark:text-white block">
              {s('chooseFileLabel')}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-1">
              {s('dragDropHint')}
            </span>
            <span className="mt-3 inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300">
              {fileName}
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {s('exportTitleLabel')}
            </label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[10px] text-gray-500 block">{s('wordsLabel')}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{wordsCount.toLocaleString(lang)}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[10px] text-gray-500 block">{s('charactersLabel')}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{charsCount.toLocaleString(lang)}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[10px] text-gray-500 block">{s('readTimeLabel')}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{s('readTimeValue').replace('{n}', String(readingTimeMin))}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-bold">{s('privacyTitle')}</span>
              <p className="text-[11px] mt-0.5 opacity-90">
                {s('privacyText')}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadWordDoc}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{s('exportWordBtn')}</span>
            </button>
            <button
              onClick={handleDownloadTxt}
              className="py-2.5 px-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.TXT</span>
            </button>
          </div>
        </div>

        {/* Right: Editable Workspace */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {s('editableLabel')}
            </label>
            <span className="text-[11px] text-gray-400">{s('directlyEditable')}</span>
          </div>
          <textarea
            rows={15}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full flex-1 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white font-mono leading-relaxed focus:ring-2 focus:ring-orange-500"
            placeholder={s('editorPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
};
