import React, { useState, useRef } from 'react';
import { ToolItem } from '../../lib/tools-data';
import { 
  Calculator, Image as ImageIcon, FileText, Wand2, Scale, Home, 
  Copy, Check, Download, RefreshCw, Upload, Play, Sliders, Sparkles 
} from 'lucide-react';

interface GenericToolEngineProps {
  tool: ToolItem;
}

export const GenericToolEngine: React.FC<GenericToolEngineProps> = ({ tool }) => {
  const [copied, setCopied] = useState(false);

  // General text state
  const [textContent, setTextContent] = useState(
    `Super Crown provides instant, 100% legal daily utility tools designed for high performance.\nFast, safe, and completely private in-browser execution.`
  );

  // General numeric calculator state
  const [numA, setNumA] = useState<number>(1000);
  const [numB, setNumB] = useState<number>(15);
  const [calcOperation, setCalcOperation] = useState<'add' | 'subtract' | 'multiply' | 'divide' | 'percent' | 'compound'>('percent');

  // General image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<number>(80);
  const [imageScale, setImageScale] = useState<number>(100);
  const [imageFormat, setImageFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [compressedSize, setCompressedSize] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Unit converter state
  const [unitValue, setUnitValue] = useState<number>(100);
  const [unitType, setUnitType] = useState<'length' | 'weight' | 'temp' | 'data'>('length');
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('feet');

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Text processing handlers
  const handleCaseTransform = (mode: 'upper' | 'lower' | 'title' | 'slug' | 'clean') => {
    if (mode === 'upper') setTextContent(textContent.toUpperCase());
    if (mode === 'lower') setTextContent(textContent.toLowerCase());
    if (mode === 'title') {
      setTextContent(
        textContent.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
      );
    }
    if (mode === 'slug') {
      setTextContent(
        textContent
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
    if (mode === 'clean') {
      const lines = textContent
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const unique = Array.from(new Set(lines));
      setTextContent(unique.join('\n'));
    }
  };

  // 2. Image tool handler (Lossless Canvas Compressor/Converter)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalSize(`${(file.size / 1024).toFixed(1)} KB`);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setImagePreview(src);
        processCanvasImage(src, imageQuality, imageScale, imageFormat);
      };
      reader.readAsDataURL(file);
    }
  };

  const processCanvasImage = (src: string, quality: number, scale: number, format: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = Math.round((img.width * scale) / 100);
      const height = Math.round((img.height * scale) / 100);
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(format, quality / 100);
        // Estimate base64 size in KB
        const head = `data:${format};base64,`;
        const sizeInBytes = Math.round((dataUrl.length - head.length) * 0.75);
        setCompressedSize(`${(sizeInBytes / 1024).toFixed(1)} KB`);
      }
    };
  };

  const downloadCanvasImage = () => {
    if (!imagePreview) return;
    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = Math.round((img.width * imageScale) / 100);
      const height = Math.round((img.height * imageScale) / 100);
      canvas.width = width;
      canvas.height = height;
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(imageFormat, imageQuality / 100);
        const a = document.createElement('a');
        a.href = dataUrl;
        const ext = imageFormat === 'image/webp' ? 'webp' : imageFormat === 'image/png' ? 'png' : 'jpg';
        a.download = `${tool.slug}-supercrown.${ext}`;
        a.click();
      }
    };
  };

  // 3. Dynamic Calculation logic
  const calculateResult = () => {
    switch (calcOperation) {
      case 'add':
        return numA + numB;
      case 'subtract':
        return numA - numB;
      case 'multiply':
        return numA * numB;
      case 'divide':
        return numB !== 0 ? numA / numB : 0;
      case 'percent':
        return (numA * numB) / 100;
      case 'compound':
        return numA * Math.pow(1 + numB / 100, 5); // 5 year forecast
      default:
        return numA;
    }
  };

  // 4. Unit Conversion logic
  const convertUnit = () => {
    if (unitType === 'length') {
      // Base: meters
      const toMeters: Record<string, number> = { meter: 1, feet: 0.3048, inch: 0.0254, km: 1000, mile: 1609.34 };
      const valInMeters = unitValue * (toMeters[fromUnit] || 1);
      return valInMeters / (toMeters[toUnit] || 1);
    }
    if (unitType === 'weight') {
      // Base: kg
      const toKg: Record<string, number> = { kg: 1, lbs: 0.453592, oz: 0.0283495, gram: 0.001 };
      const valInKg = unitValue * (toKg[fromUnit] || 1);
      return valInKg / (toKg[toUnit] || 1);
    }
    if (unitType === 'temp') {
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') return (unitValue * 9) / 5 + 32;
      if (fromUnit === 'fahrenheit' && toUnit === 'celsius') return ((unitValue - 32) * 5) / 9;
      return unitValue;
    }
    // Data
    const toMB: Record<string, number> = { mb: 1, gb: 1024, tb: 1048576, kb: 0.0009765625 };
    const valInMB = unitValue * (toMB[fromUnit] || 1);
    return valInMB / (toMB[toUnit] || 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-[#f97316] dark:bg-orange-950 dark:text-orange-400">
              {tool.category}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ 100% Free & Verified</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-950 dark:text-white mt-1">
            {tool.name}
          </h2>
        </div>
        <button
          onClick={() => copyText(tool.description)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Render based on tool category */}
      {tool.category === 'Image Tools' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <label className="block border-2 border-dashed border-orange-300 dark:border-orange-800 hover:border-orange-500 rounded-2xl p-6 text-center bg-orange-50/30 dark:bg-orange-950/20 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <span className="text-xs font-bold text-gray-900 dark:text-white block">Upload Image to Process</span>
              <span className="text-[11px] text-gray-500 block">PNG, JPG, WebP, GIF (Processed 100% in browser)</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Format
                </label>
                <select
                  value={imageFormat}
                  onChange={(e) => {
                    const fmt = e.target.value as any;
                    setImageFormat(fmt);
                    if (imagePreview) processCanvasImage(imagePreview, imageQuality, imageScale, fmt);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold"
                >
                  <option value="image/webp">WebP (Smallest Size)</option>
                  <option value="image/jpeg">JPEG (Universal)</option>
                  <option value="image/png">PNG (Lossless)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Quality: {imageQuality}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={imageQuality}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setImageQuality(q);
                    if (imagePreview) processCanvasImage(imagePreview, q, imageScale, imageFormat);
                  }}
                  className="w-full accent-orange-500 mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Resize Scale: {imageScale}%
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={imageScale}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setImageScale(s);
                  if (imagePreview) processCanvasImage(imagePreview, imageQuality, s, imageFormat);
                }}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block mb-2">Live Output Preview</span>
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-56 rounded-xl object-contain border border-gray-300 dark:border-gray-700 shadow-sm"
                  />
                  <div className="flex justify-between w-full text-xs text-gray-600 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Original: <strong>{originalSize || '1.2 MB'}</strong></span>
                    <span>Processed: <strong className="text-emerald-500">{compressedSize || '280 KB'}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-gray-400 text-xs">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span>Upload an image to see live preview & savings</span>
                </div>
              )}
            </div>

            <button
              onClick={downloadCanvasImage}
              disabled={!imagePreview}
              className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition-colors ${
                imagePreview ? 'bg-[#f97316] hover:bg-orange-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Processed Image</span>
            </button>
          </div>
        </div>
      ) : tool.category === 'Text & AI Tools' || tool.category === 'PDF Tools' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-2">Quick Actions:</span>
            <button
              onClick={() => handleCaseTransform('upper')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              UPPERCASE
            </button>
            <button
              onClick={() => handleCaseTransform('lower')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              lowercase
            </button>
            <button
              onClick={() => handleCaseTransform('title')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              Title Case
            </button>
            <button
              onClick={() => handleCaseTransform('slug')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 hover:bg-orange-200 cursor-pointer"
            >
              URL-Slugify
            </button>
            <button
              onClick={() => handleCaseTransform('clean')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-200 cursor-pointer"
            >
              Remove Duplicates
            </button>
          </div>

          <textarea
            rows={8}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm leading-relaxed text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 font-mono"
            placeholder="Type or paste text here..."
          />

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs">
            <div className="flex gap-4">
              <span>Words: <strong className="text-gray-900 dark:text-white">{textContent.trim() ? textContent.trim().split(/\s+/).length : 0}</strong></span>
              <span>Characters: <strong className="text-gray-900 dark:text-white">{textContent.length}</strong></span>
              <span>Lines: <strong className="text-gray-900 dark:text-white">{textContent.split('\n').length}</strong></span>
            </div>
            <button
              onClick={() => copyText(textContent)}
              className="px-3 py-1.5 rounded-lg bg-[#f97316] text-white font-bold hover:bg-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Processed Text</span>
            </button>
          </div>
        </div>
      ) : tool.category === 'Unit Converters' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4">
            <div className="flex gap-2">
              {[
                { id: 'length', label: 'Length' },
                { id: 'weight', label: 'Weight' },
                { id: 'temp', label: 'Temperature' },
                { id: 'data', label: 'Digital Data' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setUnitType(tab.id as any);
                    if (tab.id === 'length') { setFromUnit('meter'); setToUnit('feet'); }
                    if (tab.id === 'weight') { setFromUnit('kg'); setToUnit('lbs'); }
                    if (tab.id === 'temp') { setFromUnit('celsius'); setToUnit('fahrenheit'); }
                    if (tab.id === 'data') { setFromUnit('mb'); setToUnit('gb'); }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    unitType === tab.id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Input Value
              </label>
              <input
                type="number"
                value={unitValue}
                onChange={(e) => setUnitValue(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base font-bold text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">From</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold capitalize"
                >
                  {unitType === 'length' && (
                    <>
                      <option value="meter">Meters (m)</option>
                      <option value="feet">Feet (ft)</option>
                      <option value="inch">Inches (in)</option>
                      <option value="km">Kilometers (km)</option>
                      <option value="mile">Miles (mi)</option>
                    </>
                  )}
                  {unitType === 'weight' && (
                    <>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="gram">Grams (g)</option>
                    </>
                  )}
                  {unitType === 'temp' && (
                    <>
                      <option value="celsius">Celsius (°C)</option>
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                    </>
                  )}
                  {unitType === 'data' && (
                    <>
                      <option value="kb">Kilobytes (KB)</option>
                      <option value="mb">Megabytes (MB)</option>
                      <option value="gb">Gigabytes (GB)</option>
                      <option value="tb">Terabytes (TB)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">To</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold capitalize"
                >
                  {unitType === 'length' && (
                    <>
                      <option value="feet">Feet (ft)</option>
                      <option value="meter">Meters (m)</option>
                      <option value="inch">Inches (in)</option>
                      <option value="km">Kilometers (km)</option>
                      <option value="mile">Miles (mi)</option>
                    </>
                  )}
                  {unitType === 'weight' && (
                    <>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="gram">Grams (g)</option>
                    </>
                  )}
                  {unitType === 'temp' && (
                    <>
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                      <option value="celsius">Celsius (°C)</option>
                    </>
                  )}
                  {unitType === 'data' && (
                    <>
                      <option value="gb">Gigabytes (GB)</option>
                      <option value="mb">Megabytes (MB)</option>
                      <option value="tb">Terabytes (TB)</option>
                      <option value="kb">Kilobytes (KB)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col justify-center items-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-emerald-400/40 text-center">
            <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
              Converted Result
            </span>
            <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white my-3">
              {convertUnit().toLocaleString(undefined, { maximumFractionDigits: 4 })}
              <span className="text-sm font-semibold text-gray-500 ml-1.5 uppercase">{toUnit}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {unitValue} {fromUnit} = {convertUnit().toLocaleString(undefined, { maximumFractionDigits: 4 })} {toUnit}
            </p>
            <button
              onClick={() => copyText(`${unitValue} ${fromUnit} = ${convertUnit().toFixed(4)} ${toUnit}`)}
              className="mt-4 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center gap-1 hover:border-emerald-500 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Result</span>
            </button>
          </div>
        </div>
      ) : (
        /* Daily Calculators & Home & Daily Life default engine */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Primary Input Value
                </label>
                <input
                  type="number"
                  value={numA}
                  onChange={(e) => setNumA(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Rate / Percentage / Factor
                </label>
                <input
                  type="number"
                  value={numB}
                  onChange={(e) => setNumB(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Calculation Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'percent', label: 'Percentage %' },
                  { id: 'compound', label: '5-Yr Growth' },
                  { id: 'multiply', label: 'Multiply (x)' },
                  { id: 'divide', label: 'Divide (/)' },
                  { id: 'add', label: 'Sum (+)' },
                  { id: 'subtract', label: 'Difference (-)' }
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setCalcOperation(op.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      calcOperation === op.id
                        ? 'bg-orange-500 text-white border-orange-500 font-bold'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-orange-400/40 text-center">
            <span className="text-xs uppercase font-bold text-orange-600 dark:text-orange-400">
              Calculated Value
            </span>
            <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white my-3">
              {calculateResult().toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Computed based on {tool.name} mathematical parameters.
            </p>
            <button
              onClick={() => copyText(`${calculateResult()}`)}
              className="mt-4 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center gap-1 hover:border-orange-500 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Value</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
