import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ImagePlus, Link2, Loader2, ScanLine, Type } from 'lucide-react';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import Tesseract from 'tesseract.js';
import type { ToolItem } from '../../../lib/tools-data';
import {
  ImageCard,
  FileDrop,
  SampleBtn,
  PrimaryBtn,
  BlobDownloadBtn,
  TransparencyBg,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
  CopyBtn,
  Stat,
  ErrorBox,
} from './ImageShell';
import { DownloadBtn } from '../dev/DevShell';
import { COMMON, useStrings } from '../../../lib/LangContext';
import { IMAGE_STRINGS } from '../../../lib/strings/image';
import {
  fileToImage,
  imageToCanvas,
  canvasToBlobP,
  getPixelData,
  centeredCropRect,
  PASSPORT_SIZES,
  wifiPayload,
  vCardPayload,
  smsPayload,
  mailtoPayload,
  buildIco,
} from '../../../lib/image/core';

// ---------------- local helpers ----------------

/** Object URL for a blob, revoked when the blob changes or on unmount. */
const useObjectUrl = (blob: Blob | null): string | null => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
};

const stripExt = (name: string): string => name.replace(/\.[^.]+$/, '') || 'image';

const errText = (e: unknown, fallback: string): string =>
  e instanceof Error && e.message ? e.message : fallback;

const statusText = (msg: string) =>
  msg ? <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{msg}</p> : null;

// ============================================================
// 1. AI Background Remover
// ============================================================

export const AiBackgroundRemover: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const c = useStrings(COMMON);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [colored, setColored] = useState<Blob | null>(null);

  const fileUrl = useObjectUrl(file);
  const resultUrl = useObjectUrl(result);
  const coloredUrl = useObjectUrl(colored);

  const pickFile = (f: File) => {
    setFile(f);
    setResult(null);
    setColored(null);
    setError('');
    setStatus('');
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setResult(null);
    setColored(null);
    setStatus(s('loadingAiModel'));
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const out = await removeBackground(file, {
        output: { format: 'image/png' },
        progress: (_key, current, total) => {
          if (total > 0) setStatus(s('processingPct').replace('{pct}', String(Math.round((current / total) * 100))));
          else setStatus(c('processing'));
        },
      });
      setResult(out);
      setStatus(s('bgRemovedDone'));
    } catch (e) {
      setError(errText(e, s('bgRemovalFailed')));
      setStatus('');
    }
    setBusy(false);
  };

  // Composite the cutout over the chosen color whenever either changes.
  useEffect(() => {
    let cancelled = false;
    if (!result) {
      setColored(null);
      return;
    }
    (async () => {
      try {
        const img = await fileToImage(result);
        const canvas = imageToCanvas(img);
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const blob = await canvasToBlobP(canvas, 'image/png');
        if (!cancelled) setColored(blob);
      } catch {
        if (!cancelled) setColored(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [result, bgColor]);

  return (
    <ImageCard
      tool={tool}
      note={s('aiModelNote')}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={pickFile} fileName={file?.name ?? null} />
          </div>
          <SampleBtn onFile={pickFile} />
        </div>

        {fileUrl && (
          <div>
            <OptLabel>{c('original')}</OptLabel>
            <img src={fileUrl} alt={c('original')} className="max-h-56 rounded-xl border border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-800" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryBtn onClick={run} disabled={!file || busy}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {c('working')}
              </span>
            ) : (
              s('removeBackground')
            )}
          </PrimaryBtn>
          {statusText(status)}
        </div>

        {error && <ErrorBox message={error} />}

        {result && resultUrl && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <OptLabel>{s('transparentPng')}</OptLabel>
              <TransparencyBg>
                <img src={resultUrl} alt={s('altBgRemoved')} className="w-full h-auto block" />
              </TransparencyBg>
              <div className="mt-2">
                <BlobDownloadBtn blob={result} filename={`${stripExt(file?.name || 'image')}-no-bg.png`} label={s('downloadTransparentPng')} />
              </div>
            </div>
            <div>
              <OptLabel>{s('onColorBg')}</OptLabel>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer"
                />
                <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{bgColor}</span>
              </div>
              {coloredUrl && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <img src={coloredUrl} alt={s('altOnColorBg')} className="w-full h-auto block" />
                </div>
              )}
              <div className="mt-2">
                <BlobDownloadBtn blob={colored} filename={`${stripExt(file?.name || 'image')}-on-color.png`} label={s('downloadOnColor')} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ImageCard>
  );
};

// ============================================================
// 2. Image Background Changer
// ============================================================

const SOLID_PRESETS = ['#ffffff', '#000000', '#9ca3af', '#f8fafc', '#1e3a8a', '#be123c', '#065f46', '#f59e0b'];

export const ImageBackgroundChanger: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const c = useStrings(COMMON);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [bgKind, setBgKind] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [solid, setSolid] = useState('#ffffff');
  const [gradFrom, setGradFrom] = useState('#f59e0b');
  const [gradTo, setGradTo] = useState('#ef4444');
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const resultUrl = useObjectUrl(result);
  const bgUrl = useObjectUrl(bgFile);

  const pickFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError('');
    setStatus('');
  };

  const applyGradientPreset = (from: string, to: string) => {
    setBgKind('gradient');
    setGradFrom(from);
    setGradTo(to);
  };

  const run = async () => {
    if (!file) return;
    if (bgKind === 'image' && !bgFile) {
      setError(s('chooseBgImageFirst'));
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    setStatus(s('loadingAiModel'));
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const cutout = await removeBackground(file, {
        output: { format: 'image/png' },
        progress: (_key, current, total) => {
          if (total > 0) setStatus(s('removingBgPct').replace('{pct}', String(Math.round((current / total) * 100))));
          else setStatus(s('removingBg'));
        },
      });
      setStatus(s('compositingBg'));
      const fg = await fileToImage(cutout);
      const canvas = document.createElement('canvas');
      canvas.width = fg.naturalWidth;
      canvas.height = fg.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      if (bgKind === 'solid') {
        ctx.fillStyle = solid;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgKind === 'gradient') {
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, gradFrom);
        g.addColorStop(1, gradTo);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgFile) {
        const bgImg = await fileToImage(bgFile);
        const scale = Math.max(canvas.width / bgImg.naturalWidth, canvas.height / bgImg.naturalHeight);
        const dw = bgImg.naturalWidth * scale;
        const dh = bgImg.naturalHeight * scale;
        ctx.drawImage(bgImg, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
      }
      ctx.drawImage(fg, 0, 0);
      setResult(await canvasToBlobP(canvas, 'image/png'));
      setStatus(s('bgChangedDone'));
    } catch (e) {
      setError(errText(e, s('bgChangeFailed')));
      setStatus('');
    }
    setBusy(false);
  };

  return (
    <ImageCard
      tool={tool}
      note={s('aiModelNote')}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={pickFile} fileName={file?.name ?? null} />
          </div>
          <SampleBtn onFile={pickFile} />
        </div>

        <div>
          <OptLabel>{s('bgType')}</OptLabel>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['solid', s('solidColor')],
                ['gradient', s('gradient')],
                ['image', s('yourPhoto')],
              ] as const
            ).map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                onClick={() => setBgKind(kind)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  bgKind === kind
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {bgKind === 'solid' && (
          <div>
            <OptLabel>{s('color')}</OptLabel>
            <div className="flex flex-wrap items-center gap-2">
              {SOLID_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => setSolid(c)}
                  className={`w-9 h-9 rounded-lg border-2 cursor-pointer ${solid === c ? 'border-rose-600' : 'border-gray-200 dark:border-gray-700'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={solid}
                onChange={(e) => setSolid(e.target.value)}
                className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer"
              />
              <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{solid}</span>
            </div>
          </div>
        )}

        {bgKind === 'gradient' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyGradientPreset('#f59e0b', '#ef4444')} className="px-3 py-2 rounded-xl text-xs font-bold text-white border border-gray-200 dark:border-gray-700 cursor-pointer" style={{ backgroundImage: 'linear-gradient(90deg,#f59e0b,#ef4444)' }}>
                {s('sunset')}
              </button>
              <button type="button" onClick={() => applyGradientPreset('#38bdf8', '#1e40af')} className="px-3 py-2 rounded-xl text-xs font-bold text-white border border-gray-200 dark:border-gray-700 cursor-pointer" style={{ backgroundImage: 'linear-gradient(90deg,#38bdf8,#1e40af)' }}>
                {s('ocean')}
              </button>
              <button type="button" onClick={() => applyGradientPreset('#e5e7eb', '#6b7280')} className="px-3 py-2 rounded-xl text-xs font-bold text-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer" style={{ backgroundImage: 'linear-gradient(90deg,#e5e7eb,#6b7280)' }}>
                {s('studio')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <div>
                <OptLabel>{s('from')}</OptLabel>
                <div className="flex items-center gap-2">
                  <input type="color" value={gradFrom} onChange={(e) => setGradFrom(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
                  <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{gradFrom}</span>
                </div>
              </div>
              <div>
                <OptLabel>{s('to')}</OptLabel>
                <div className="flex items-center gap-2">
                  <input type="color" value={gradTo} onChange={(e) => setGradTo(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
                  <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{gradTo}</span>
                </div>
              </div>
            </div>
            <div className="h-16 rounded-xl border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }} />
          </div>
        )}

        {bgKind === 'image' && (
          <div>
            <OptLabel>{s('bgPhotoCoverFit')}</OptLabel>
            <FileDrop onFile={setBgFile} label={s('dropBgImageHere')} fileName={bgFile?.name ?? null} />
            {bgUrl && <img src={bgUrl} alt={s('altBackground')} className="mt-2 max-h-32 rounded-xl border border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-800" />}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryBtn onClick={run} disabled={!file || busy}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {c('working')}
              </span>
            ) : (
              s('changeBackground')
            )}
          </PrimaryBtn>
          {statusText(status)}
        </div>

        {error && <ErrorBox message={error} />}

        {result && resultUrl && (
          <div>
            <OptLabel>{c('result')}</OptLabel>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <img src={resultUrl} alt={s('altNewBackground')} className="w-full h-auto block" />
            </div>
            <div className="mt-2">
              <BlobDownloadBtn blob={result} filename={`${stripExt(file?.name || 'image')}-new-bg.png`} label={s('downloadPng')} />
            </div>
          </div>
        )}
      </div>
    </ImageCard>
  );
};

// ============================================================
// 3. QR Code Generator
// ============================================================

type QrType = 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'phone';
type Ecl = 'L' | 'M' | 'Q' | 'H';

export const QrCodeGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const c = useStrings(COMMON);
  const [type, setType] = useState<QrType>('text');
  // text / url
  const [text, setText] = useState('https://example.com');
  // wifi
  const [ssid, setSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  // vcard
  const [vcName, setVcName] = useState('');
  const [vcOrg, setVcOrg] = useState('');
  const [vcTitle, setVcTitle] = useState('');
  const [vcPhone, setVcPhone] = useState('');
  const [vcEmail, setVcEmail] = useState('');
  const [vcUrl, setVcUrl] = useState('');
  const [vcAddress, setVcAddress] = useState('');
  // email
  const [emTo, setEmTo] = useState('');
  const [emSubject, setEmSubject] = useState('');
  const [emBody, setEmBody] = useState('');
  // sms / phone
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMsg, setSmsMsg] = useState('');
  const [telNumber, setTelNumber] = useState('');
  // style
  const [size, setSize] = useState(512);
  const [dark, setDark] = useState('#000000');
  const [light, setLight] = useState('#ffffff');
  const [ecl, setEcl] = useState<Ecl>('M');
  const [margin, setMargin] = useState(true);

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [qrError, setQrError] = useState('');

  const payload = (() => {
    switch (type) {
      case 'text':
        return text;
      case 'wifi':
        return ssid ? wifiPayload({ ssid, password: wifiPass, encryption, hidden }) : '';
      case 'vcard': {
        const parts = vcName.trim().split(/\s+/);
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ');
        return vCardPayload({
          firstName,
          lastName,
          org: vcOrg,
          title: vcTitle,
          phone: vcPhone,
          email: vcEmail,
          url: vcUrl,
          street: vcAddress,
        });
      }
      case 'email':
        return emTo ? mailtoPayload(emTo, emSubject, emBody) : '';
      case 'sms':
        return smsPhone ? smsPayload(smsPhone, smsMsg) : '';
      case 'phone':
        return telNumber ? `tel:${telNumber.replace(/\s/g, '')}` : '';
      default:
        return '';
    }
  })();

  useEffect(() => {
    let cancelled = false;
    setQrError('');
    if (!payload.trim()) {
      setQrUrl(null);
      setQrSvg(null);
      return;
    }
    QRCode.toDataURL(payload, {
      width: size,
      margin: margin ? 2 : 0,
      color: { dark, light },
      errorCorrectionLevel: ecl,
    })
      .then((u) => {
        if (!cancelled) setQrUrl(u);
      })
      .catch(() => {
        if (!cancelled) {
          setQrUrl(null);
          setQrError(s('qrTooLong'));
        }
      });
    QRCode.toString(payload, {
      type: 'svg',
      width: size,
      margin: margin ? 2 : 0,
      color: { dark, light },
      errorCorrectionLevel: ecl,
    })
      .then((s) => {
        if (!cancelled) setQrSvg(s);
      })
      .catch(() => {
        if (!cancelled) setQrSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [payload, size, dark, light, ecl, margin]);

  const tabs: { id: QrType; labelKey: string }[] = [
    { id: 'text', labelKey: 'qrTextUrl' },
    { id: 'wifi', labelKey: 'wifi' },
    { id: 'vcard', labelKey: 'qrContact' },
    { id: 'email', labelKey: 'email' },
    { id: 'sms', labelKey: 'sms' },
    { id: 'phone', labelKey: 'phone' },
  ];

  return (
    <ImageCard
      tool={tool}
      note={s('qrNote')}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  type === t.id
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {s(t.labelKey)}
              </button>
            ))}
          </div>

          {type === 'text' && (
            <div>
              <OptLabel>{s('textOrUrl')}</OptLabel>
              <OptInput value={text} onChange={(e) => setText(e.target.value)} placeholder={s('qrTextPlaceholder')} />
            </div>
          )}

          {type === 'wifi' && (
            <div className="space-y-3">
              <div>
                <OptLabel>{s('networkName')}</OptLabel>
                <OptInput value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyHomeWiFi" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <OptLabel>{s('password')}</OptLabel>
                  <OptInput value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="••••••••" />
                </div>
                <div>
                  <OptLabel>{s('security')}</OptLabel>
                  <OptSelect value={encryption} onChange={(e) => setEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}>
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">{s('openNoPassword')}</option>
                  </OptSelect>
                </div>
              </div>
              <OptCheck label={s('hiddenNetwork')} checked={hidden} onChange={setHidden} />
            </div>
          )}

          {type === 'vcard' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <OptLabel>{s('fullName')}</OptLabel>
                <OptInput value={vcName} onChange={(e) => setVcName(e.target.value)} placeholder="Ada Lovelace" />
              </div>
              <div>
                <OptLabel>{s('organization')}</OptLabel>
                <OptInput value={vcOrg} onChange={(e) => setVcOrg(e.target.value)} />
              </div>
              <div>
                <OptLabel>{s('jobTitle')}</OptLabel>
                <OptInput value={vcTitle} onChange={(e) => setVcTitle(e.target.value)} />
              </div>
              <div>
                <OptLabel>{s('phone')}</OptLabel>
                <OptInput value={vcPhone} onChange={(e) => setVcPhone(e.target.value)} placeholder="+92 300 0000000" />
              </div>
              <div>
                <OptLabel>{s('email')}</OptLabel>
                <OptInput value={vcEmail} onChange={(e) => setVcEmail(e.target.value)} />
              </div>
              <div>
                <OptLabel>{s('website')}</OptLabel>
                <OptInput value={vcUrl} onChange={(e) => setVcUrl(e.target.value)} placeholder="https://…" />
              </div>
              <div className="sm:col-span-2">
                <OptLabel>{s('address')}</OptLabel>
                <OptInput value={vcAddress} onChange={(e) => setVcAddress(e.target.value)} />
              </div>
            </div>
          )}

          {type === 'email' && (
            <div className="space-y-3">
              <div>
                <OptLabel>{s('recipientEmail')}</OptLabel>
                <OptInput value={emTo} onChange={(e) => setEmTo(e.target.value)} placeholder="someone@example.com" />
              </div>
              <div>
                <OptLabel>{s('subject')}</OptLabel>
                <OptInput value={emSubject} onChange={(e) => setEmSubject(e.target.value)} />
              </div>
              <div>
                <OptLabel>{s('body')}</OptLabel>
                <OptInput value={emBody} onChange={(e) => setEmBody(e.target.value)} />
              </div>
            </div>
          )}

          {type === 'sms' && (
            <div className="space-y-3">
              <div>
                <OptLabel>{s('phoneNumber')}</OptLabel>
                <OptInput value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} placeholder="+92 300 0000000" />
              </div>
              <div>
                <OptLabel>{s('message')}</OptLabel>
                <OptInput value={smsMsg} onChange={(e) => setSmsMsg(e.target.value)} />
              </div>
            </div>
          )}

          {type === 'phone' && (
            <div>
              <OptLabel>{s('phoneNumber')}</OptLabel>
              <OptInput value={telNumber} onChange={(e) => setTelNumber(e.target.value)} placeholder="+92 300 0000000" />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <OptLabel>{s('sizePx')}</OptLabel>
              <OptSelect value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))}>
                <option value={256}>256</option>
                <option value={512}>512</option>
                <option value={1024}>1024</option>
              </OptSelect>
            </div>
            <div>
              <OptLabel>{s('errorCorrection')}</OptLabel>
              <OptSelect value={ecl} onChange={(e) => setEcl(e.target.value as Ecl)}>
                <option value="L">{s('eclL')}</option>
                <option value="M">{s('eclM')}</option>
                <option value="Q">{s('eclQ')}</option>
                <option value="H">{s('eclH')}</option>
              </OptSelect>
            </div>
            <div>
              <OptLabel>{s('codeColor')}</OptLabel>
              <div className="flex items-center gap-2">
                <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
                <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{dark}</span>
              </div>
            </div>
            <div>
              <OptLabel>{s('bgColor')}</OptLabel>
              <div className="flex items-center gap-2">
                <input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
                <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{light}</span>
              </div>
            </div>
          </div>
          <OptCheck label={s('quietZone')} checked={margin} onChange={setMargin} />

          <div>
            <OptLabel>{s('encodedContent')}</OptLabel>
            <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs font-mono overflow-auto max-h-40 whitespace-pre-wrap break-all text-gray-900 dark:text-gray-100">
              {payload || s('fillFieldsToEncode')}
            </pre>
          </div>
        </div>

        <div className="space-y-3">
          <OptLabel>{c('preview')}</OptLabel>
          {qrError && <ErrorBox message={qrError} />}
          {qrUrl ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden inline-block bg-white">
              <img src={qrUrl} alt={s('altQrCode')} className="w-full max-w-[320px] h-auto block" />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center text-xs font-semibold text-gray-500">
              {s('qrWillAppear')}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {qrUrl && (
              <a
                href={qrUrl}
                download="qr-code.png"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 cursor-pointer"
              >
                {s('downloadPng')}
              </a>
            )}
            <BlobDownloadBtn
              blob={qrSvg ? new Blob([qrSvg], { type: 'image/svg+xml' }) : null}
              filename="qr-code.svg"
              label={s('downloadSvg')}
            />
          </div>
        </div>
      </div>
    </ImageCard>
  );
};

// ============================================================
// 4. QR Code Scanner
// ============================================================

export const QrCodeScanner: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [cameraOn, setCameraOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const scanningRef = useRef(false);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const scanFile = async (f: File) => {
    stopCamera();
    setFileName(f.name);
    setResult(null);
    setNotFound(false);
    setError('');
    try {
      const img = await fileToImage(f);
      const scale = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = imageToCanvas(
        img,
        Math.max(1, Math.round(img.naturalWidth * scale)),
        Math.max(1, Math.round(img.naturalHeight * scale)),
      );
      const px = getPixelData(canvas);
      const code = jsQR(px.data as Uint8ClampedArray, px.width, px.height);
      if (code && code.data) setResult(code.data);
      else setNotFound(true);
    } catch (e) {
      setError(errText(e, s('couldNotReadImage')));
    }
  };

  const tick = useCallback(() => {
    if (!scanningRef.current) return;
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      if (!scanCanvasRef.current) scanCanvasRef.current = document.createElement('canvas');
      const canvas = scanCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, canvas.width, canvas.height);
      if (code && code.data) {
        setResult(code.data);
        setNotFound(false);
        stopCamera();
        return;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [stopCamera]);

  const startCamera = async () => {
    setResult(null);
    setNotFound(false);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setError(s('cameraUnavailable'));
    }
  };

  // Attach the stream once the <video> element exists, then start the scan loop.
  useEffect(() => {
    if (!cameraOn) return;
    const video = videoRef.current;
    if (video && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => undefined);
      scanningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      scanningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [cameraOn, tick]);

  const isLink = result ? /^https?:\/\//i.test(result) : false;

  return (
    <ImageCard
      tool={tool}
      note={s('scannerNote')}
    >
      <div className="space-y-4">
        <FileDrop onFile={scanFile} label={s('dropQrImage')} fileName={fileName} />

        <div className="flex flex-wrap items-center gap-2">
          {!cameraOn ? (
            <PrimaryBtn onClick={startCamera}>
              <span className="inline-flex items-center gap-2">
                <Camera className="w-4 h-4" /> {s('useCamera')}
              </span>
            </PrimaryBtn>
          ) : (
            <PrimaryBtn onClick={stopCamera}>
              <span className="inline-flex items-center gap-2">
                <CameraOff className="w-4 h-4" /> {s('stopCamera')}
              </span>
            </PrimaryBtn>
          )}
          {cameraOn && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <ScanLine className="w-4 h-4 text-rose-500" /> {s('pointCamera')}
            </span>
          )}
        </div>

        {cameraOn && (
          <video ref={videoRef} playsInline muted autoPlay className="w-full max-h-96 rounded-xl border border-gray-200 dark:border-gray-700 bg-black object-contain" />
        )}

        {error && <ErrorBox message={error} />}

        {notFound && (
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
            {s('noQrFound')}
          </div>
        )}

        {result && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{s('decodedContent')}</p>
            <p className="text-sm font-mono break-all whitespace-pre-wrap text-gray-900 dark:text-gray-100">{result}</p>
            <div className="flex flex-wrap gap-2">
              <CopyBtn text={result} label={s('copyResult')} />
              {isLink && (
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" /> {s('openLink')}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </ImageCard>
  );
};

// ============================================================
// 5. Meme Generator
// ============================================================

const wrapTextLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
};

export const MemeGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontPct, setFontPct] = useState(9);
  const [bars, setBars] = useState(false);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pickFile = async (f: File) => {
    setFileName(f.name);
    try {
      setImg(await fileToImage(f));
    } catch {
      setImg(null);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const maxW = 1000;
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);

    const size = Math.max(12, Math.round((w * fontPct) / 100));
    ctx.font = `900 ${size}px Impact, 'Arial Black', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const drawBlock = (raw: string, isTop: boolean) => {
      const text = raw.trim().toUpperCase();
      if (!text) return;
      const lines = wrapTextLines(ctx, text, w * 0.92, 3);
      if (!lines.length) return;
      const lineH = size * 1.15;
      const blockH = lines.length * lineH;
      const pad = size * 0.35;
      ctx.fillStyle = '#ffffff';
      if (bars) {
        const barH = blockH + pad * 2;
        const barY = isTop ? 0 : h - barH;
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, barY, w, barH);
        ctx.fillStyle = '#ffffff';
        lines.forEach((ln, i) => {
          ctx.fillText(ln, w / 2, barY + pad + lineH * (i + 0.5));
        });
        ctx.restore();
      } else {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, size / 7);
        ctx.lineJoin = 'round';
        const startY = isTop ? pad + lineH / 2 : h - pad - blockH + lineH / 2;
        lines.forEach((ln, i) => {
          const y = startY + lineH * i;
          ctx.strokeText(ln, w / 2, y);
          ctx.fillText(ln, w / 2, y);
        });
      }
    };

    drawBlock(topText, true);
    drawBlock(bottomText, false);
    canvas.toBlob((b) => setOutBlob(b), 'image/png');
  }, [img, topText, bottomText, fontPct, bars]);

  return (
    <ImageCard
      tool={tool}
      note={s('memeNote')}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={pickFile} fileName={fileName} />
          </div>
          <SampleBtn onFile={pickFile} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>{s('topText')}</OptLabel>
            <OptInput value={topText} onChange={(e) => setTopText(e.target.value)} placeholder={s('memeTopPlaceholder')} />
          </div>
          <div>
            <OptLabel>{s('bottomText')}</OptLabel>
            <OptInput value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder={s('memeBottomPlaceholder')} />
          </div>
          <div>
            <OptLabel>{s('fontSizePctOfWidth').replace('{value}', String(fontPct))}</OptLabel>
            <input
              type="range"
              min={4}
              max={20}
              step={0.5}
              value={fontPct}
              onChange={(e) => setFontPct(parseFloat(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>
          <div className="flex items-end pb-1">
            <OptCheck label={s('blackBars')} checked={bars} onChange={setBars} />
          </div>
        </div>

        {img ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
              <canvas ref={canvasRef} className="w-full h-auto block" />
            </div>
            <BlobDownloadBtn blob={outBlob} filename="meme.png" label={s('downloadMemePng')} />
          </div>
        ) : (
          <p className="text-xs font-semibold text-gray-500">{s('addPhotoForMeme')}</p>
        )}
      </div>
    </ImageCard>
  );
};

// ============================================================
// 6. Image to Text (OCR)
// ============================================================

const OCR_LANGS: { code: string; label: string }[] = [
  { code: 'eng', label: 'English' },
];

export const ImageOcr: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState('eng');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const fileUrl = useObjectUrl(file);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setText('');
    setProgress(s('loadingOcrEngine'));
    let worker: Awaited<ReturnType<typeof Tesseract.createWorker>> | null = null;
    try {
      try {
        worker = await Tesseract.createWorker(lang, undefined, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(s('recognizingPct').replace('{pct}', String(Math.round((m.progress || 0) * 100))));
            } else if (m.status) {
              setProgress(`${m.status}…`);
            }
          },
        });
      } catch {
        throw new Error(
          s('ocrEngineLoadFailed'),
        );
      }
      const img = await fileToImage(file);
      const canvas = imageToCanvas(img);
      const { data } = await worker.recognize(canvas as any);
      setText((data?.text || '').trim());
      setProgress('');
    } catch (e) {
      setError(errText(e, s('ocrFailed')));
      setProgress('');
    }
    try {
      await worker?.terminate();
    } catch {
      /* worker already gone */
    }
    setBusy(false);
  };

  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const lines = text ? text.split('\n').filter((l) => l.trim()).length : 0;

  return (
    <ImageCard
      tool={tool}
      note={s('ocrNote')}
    >
      <div className="space-y-4">
        <FileDrop
          onFile={(f) => {
            setFile(f);
            setText('');
            setError('');
          }}
          fileName={file?.name ?? null}
        />

        {fileUrl && (
          <img src={fileUrl} alt={s('altForOcr')} className="max-h-64 rounded-xl border border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-800" />
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-52">
            <OptLabel>{s('language')}</OptLabel>
            <OptSelect value={lang} onChange={(e) => setLang(e.target.value)}>
              {OCR_LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.code === 'eng' ? s('langEnglish') : l.label}
                </option>
              ))}
            </OptSelect>
          </div>
          <PrimaryBtn onClick={run} disabled={!file || busy}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {s('extracting')}
              </span>
            ) : (
              s('extractText')
            )}
          </PrimaryBtn>
          {statusText(progress)}
        </div>

        {error && <ErrorBox message={error} />}

        {(text || busy) && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 max-w-md">
              <Stat label={s('words')} value={words} />
              <Stat label={s('characters')} value={text.length} />
              <Stat label={s('lines')} value={lines} />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              dir="auto"
              rows={10}
              placeholder={busy ? s('recognizing') : s('extractedTextPlaceholder')}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-white"
            />
            <div className="flex flex-wrap gap-2">
              <CopyBtn text={text} label={s('copyText')} />
              <DownloadBtn content={text} filename="extracted-text.txt" mime="text/plain" label={s('downloadTxt')} />
            </div>
          </div>
        )}
      </div>
    </ImageCard>
  );
};

// ============================================================
// 7. Passport Photo Maker
// ============================================================

export const PassportPhotoMaker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [presetId, setPresetId] = useState('uk');
  const [zoom, setZoom] = useState(1);
  const [shiftX, setShiftX] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [single, setSingle] = useState<Blob | null>(null);
  const [sheet, setSheet] = useState<Blob | null>(null);
  const [copies, setCopies] = useState(0);
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLCanvasElement>(null);

  const preset = PASSPORT_SIZES.find((p) => p.id === presetId) || PASSPORT_SIZES[1];
  const outW = Math.round((preset.widthMm / 25.4) * 300);
  const outH = Math.round((preset.heightMm / 25.4) * 300);

  const pickFile = async (f: File) => {
    setFileName(f.name);
    setError('');
    try {
      setImg(await fileToImage(f));
    } catch {
      setImg(null);
      setError(s('couldNotLoadImageFile'));
    }
  };

  useEffect(() => {
    let cancelled = false;
    const preview = previewRef.current;
    if (!img || !preview) {
      setSingle(null);
      setSheet(null);
      setCopies(0);
      return;
    }
    const aspect = preset.widthMm / preset.heightMm;
    const crop = centeredCropRect(img.naturalWidth, img.naturalHeight, aspect);
    const sw = crop.sw / zoom;
    const sh = crop.sh / zoom;
    let sx = crop.sx + (crop.sw - sw) / 2 + (shiftX / 100) * sw;
    let sy = crop.sy + (crop.sh - sh) / 2 + (shiftY / 100) * sh;
    sx = Math.min(Math.max(sx, 0), img.naturalWidth - sw);
    sy = Math.min(Math.max(sy, 0), img.naturalHeight - sh);

    preview.width = outW;
    preview.height = outH;
    preview.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    (async () => {
      try {
        const singleBlob = await canvasToBlobP(preview, 'image/png');
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = 1200;
        sheetCanvas.height = 1800;
        const sctx = sheetCanvas.getContext('2d')!;
        sctx.fillStyle = '#ffffff';
        sctx.fillRect(0, 0, 1200, 1800);
        const gap = Math.round((3 / 25.4) * 300);
        const cols = Math.max(1, Math.floor((1200 + gap) / (outW + gap)));
        const rows = Math.max(1, Math.floor((1800 + gap) / (outH + gap)));
        const gridW = cols * outW + (cols - 1) * gap;
        const gridH = rows * outH + (rows - 1) * gap;
        const ox = Math.round((1200 - gridW) / 2);
        const oy = Math.round((1800 - gridH) / 2);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            sctx.drawImage(img, sx, sy, sw, sh, ox + c * (outW + gap), oy + r * (outH + gap), outW, outH);
          }
        }
        sctx.strokeStyle = '#d1d5db';
        sctx.lineWidth = 1;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            sctx.strokeRect(ox + c * (outW + gap) + 0.5, oy + r * (outH + gap) + 0.5, outW, outH);
          }
        }
        const sheetBlob = await canvasToBlobP(sheetCanvas, 'image/png');
        if (!cancelled) {
          setSingle(singleBlob);
          setSheet(sheetBlob);
          setCopies(cols * rows);
        }
      } catch {
        if (!cancelled) {
          setSingle(null);
          setSheet(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [img, preset, zoom, shiftX, shiftY, outW, outH]);

  return (
    <ImageCard
      tool={tool}
      note={s('passportNote')}
    >
      <div className="space-y-4">
        <FileDrop onFile={pickFile} fileName={fileName} />

        {error && <ErrorBox message={error} />}

        <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
          <div>
            <OptLabel>{s('photoSize')}</OptLabel>
            <OptSelect value={presetId} onChange={(e) => setPresetId(e.target.value)}>
              {PASSPORT_SIZES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </OptSelect>
          </div>
          <div className="flex items-end pb-1">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{preset.note}</p>
          </div>
        </div>

        {img && (
          <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-start">
            <div>
              <OptLabel>{s('passportPreviewLabel').replace('{w}', String(outW)).replace('{h}', String(outH))}</OptLabel>
              <canvas ref={previewRef} className="w-44 h-auto border border-gray-300 dark:border-gray-600 shadow-sm bg-white" />
              <div className="flex flex-wrap gap-2 mt-3">
                <BlobDownloadBtn blob={single} filename="passport-photo.png" label={s('downloadPhoto')} />
                <BlobDownloadBtn blob={sheet} filename="passport-print-sheet-4x6.png" label={s('printSheetCopies').replace('{count}', String(copies))} />
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                {s('printSheetNote').replace('{count}', String(copies))}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <OptLabel>{s('zoomWithValue').replace('{value}', zoom.toFixed(2))}</OptLabel>
                <input type="range" min={1} max={2.5} step={0.05} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-rose-600" />
              </div>
              <div>
                <OptLabel>{s('shiftHWithValue').replace('{value}', String(shiftX))}</OptLabel>
                <input type="range" min={-50} max={50} step={1} value={shiftX} onChange={(e) => setShiftX(parseInt(e.target.value, 10))} className="w-full accent-rose-600" />
              </div>
              <div>
                <OptLabel>{s('shiftVWithValue').replace('{value}', String(shiftY))}</OptLabel>
                <input type="range" min={-50} max={50} step={1} value={shiftY} onChange={(e) => setShiftY(parseInt(e.target.value, 10))} className="w-full accent-rose-600" />
              </div>
              <p className="text-[11px] text-gray-500">
                {s('passportTip')}
              </p>
            </div>
          </div>
        )}
      </div>
    </ImageCard>
  );
};

// ============================================================
// 8. Favicon Generator
// ============================================================

const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

const PngThumb: React.FC<{ blob: Blob; size: number }> = ({ blob, size }) => {
  const s = useStrings(IMAGE_STRINGS);
  const url = useObjectUrl(blob);
  if (!url) return null;
  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src={url}
        alt={s('altFavicon').replace('{size}', String(size))}
        width={Math.min(size, 48)}
        height={Math.min(size, 48)}
        className="border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
      />
      <span className="text-[10px] font-semibold text-gray-500">{size}×{size}</span>
    </div>
  );
};

export const FaviconGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [glyph, setGlyph] = useState('S');
  const [bg, setBg] = useState('#e11d48');
  const [fg, setFg] = useState('#ffffff');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pngs, setPngs] = useState<{ size: number; blob: Blob }[]>([]);
  const [ico, setIco] = useState<Blob | null>(null);
  const [zip, setZip] = useState<Blob | null>(null);

  const pickFile = async (f: File) => {
    setFileName(f.name);
    try {
      setImg(await fileToImage(f));
    } catch {
      setImg(null);
    }
  };

  const generate = async () => {
    setError('');
    setBusy(true);
    try {
      const src = document.createElement('canvas');
      src.width = 512;
      src.height = 512;
      const ctx = src.getContext('2d')!;
      if (mode === 'image') {
        if (!img) {
          setError(s('chooseImageFirst'));
          setBusy(false);
          return;
        }
        const crop = centeredCropRect(img.naturalWidth, img.naturalHeight, 1);
        ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, 512, 512);
      } else {
        const g = glyph.trim();
        if (!g) {
          setError(s('enterLetterFirst'));
          setBusy(false);
          return;
        }
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = fg;
        ctx.font = `700 ${g.length > 1 ? 190 : 300}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(g, 256, 268);
      }

      const out: { size: number; blob: Blob }[] = [];
      const icoPngs = new Map<number, Uint8Array>();
      for (const s of FAVICON_SIZES) {
        const c = document.createElement('canvas');
        c.width = s;
        c.height = s;
        c.getContext('2d')!.drawImage(src, 0, 0, s, s);
        const blob = await canvasToBlobP(c, 'image/png');
        out.push({ size: s, blob });
        if (s === 16 || s === 32 || s === 48) {
          icoPngs.set(s, new Uint8Array(await blob.arrayBuffer()));
        }
      }
      const icoBytes = buildIco([16, 32, 48].map((size) => ({ size, png: icoPngs.get(size)! })));
      const icoCopy = new Uint8Array(icoBytes);
      const z = new JSZip();
      out.forEach(({ size, blob }) => z.file(`favicon-${size}x${size}.png`, blob));
      z.file('favicon.ico', icoCopy);
      const zipBlob = await z.generateAsync({ type: 'blob' });
      setPngs(out);
      setIco(new Blob([icoCopy], { type: 'image/x-icon' }));
      setZip(zipBlob);
    } catch (e) {
      setError(errText(e, s('faviconFailed')));
    }
    setBusy(false);
  };

  const snippet = [
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">',
    '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">',
  ].join('\n');

  return (
    <ImageCard
      tool={tool}
      note={s('faviconNote')}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('image')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              mode === 'image'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ImagePlus className="w-3.5 h-3.5" /> {s('fromImage')}
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              mode === 'text'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Type className="w-3.5 h-3.5" /> {s('fromTextEmoji')}
          </button>
        </div>

        {mode === 'image' ? (
          <FileDrop onFile={pickFile} fileName={fileName} />
        ) : (
          <div className="grid sm:grid-cols-3 gap-3 max-w-xl">
            <div>
              <OptLabel>{s('lettersOrEmoji')}</OptLabel>
              <OptInput value={glyph} maxLength={2} onChange={(e) => setGlyph(e.target.value)} placeholder="S" />
            </div>
            <div>
              <OptLabel>{s('background')}</OptLabel>
              <div className="flex items-center gap-2">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
                <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{bg}</span>
              </div>
            </div>
            <div>
              <OptLabel>{s('textColor')}</OptLabel>
              <div className="flex items-center gap-2">
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
                <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{fg}</span>
              </div>
            </div>
          </div>
        )}

        <PrimaryBtn onClick={generate} disabled={busy}>
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> {s('generating')}
            </span>
          ) : (
            s('generateFaviconPackage')
          )}
        </PrimaryBtn>

        {error && <ErrorBox message={error} />}

        {pngs.length > 0 && (
          <div className="space-y-4">
            <div>
              <OptLabel>{s('generatedSizes')}</OptLabel>
              <div className="flex flex-wrap gap-3">
                {pngs.map((p) => (
                  <PngThumb key={p.size} blob={p.blob} size={p.size} />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <BlobDownloadBtn blob={zip} filename="favicon-package.zip" label={s('downloadAllZip')} />
              <BlobDownloadBtn blob={ico} filename="favicon.ico" label={s('faviconIcoOnly')} />
              {pngs.map((p) => (
                <BlobDownloadBtn key={p.size} blob={p.blob} filename={`favicon-${p.size}x${p.size}.png`} label={`${p.size}px`} />
              ))}
            </div>
            <div>
              <OptLabel>{s('addToYourSite')}</OptLabel>
              <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs font-mono overflow-auto whitespace-pre text-gray-900 dark:text-gray-100">
                {snippet}
              </pre>
              <div className="mt-2">
                <CopyBtn text={snippet} label={s('copyHtml')} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ImageCard>
  );
};

// ============================================================
// 9. Image Watermark
// ============================================================

type WmPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'tile';

const WM_POSITIONS: { value: WmPosition; labelKey: string }[] = [
  { value: 'top-left', labelKey: 'posTopLeft' },
  { value: 'top-center', labelKey: 'posTopCenter' },
  { value: 'top-right', labelKey: 'posTopRight' },
  { value: 'middle-left', labelKey: 'posMiddleLeft' },
  { value: 'center', labelKey: 'posCenter' },
  { value: 'middle-right', labelKey: 'posMiddleRight' },
  { value: 'bottom-left', labelKey: 'posBottomLeft' },
  { value: 'bottom-center', labelKey: 'posBottomCenter' },
  { value: 'bottom-right', labelKey: 'posBottomRight' },
  { value: 'tile', labelKey: 'posTile' },
];

const wmCol = (pos: WmPosition): 0 | 1 | 2 => (pos.endsWith('left') ? 0 : pos.endsWith('right') ? 2 : 1);
const wmRow = (pos: WmPosition): 0 | 1 | 2 => (pos.startsWith('top') ? 0 : pos.startsWith('bottom') ? 2 : 1);

export const ImageWatermark: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(IMAGE_STRINGS);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'logo'>('text');
  const [text, setText] = useState('© Super Crown');
  const [fontPct, setFontPct] = useState(4.5);
  const [color, setColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(0.55);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(18);
  const [position, setPosition] = useState<WmPosition>('bottom-right');
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLCanvasElement>(null);

  const pickFile = async (f: File) => {
    setFileName(f.name);
    setError('');
    try {
      setImg(await fileToImage(f));
    } catch {
      setImg(null);
      setError(s('couldNotLoadImageFile'));
    }
  };

  const pickLogo = async (f: File) => {
    setLogoName(f.name);
    try {
      setLogoImg(await fileToImage(f));
    } catch {
      setLogoImg(null);
    }
  };

  const renderInto = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (!img) return;
    ctx.clearRect(0, 0, w, h);
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = opacity;
    const pad = Math.round(w * 0.03);
    const diag = Math.sqrt(w * w + h * h);

    if (mode === 'text' && text.trim()) {
      const size = Math.max(10, Math.round((w * fontPct) / 100));
      ctx.font = `700 ${size}px Arial, sans-serif`;
      ctx.fillStyle = color;
      if (position === 'tile') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const stepX = ctx.measureText(text).width + size * 2;
        const stepY = size * 3.4;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.translate(-w / 2, -h / 2);
        for (let y = -diag / 2; y < h + diag / 2; y += stepY) {
          for (let x = -diag / 2; x < w + diag / 2; x += stepX) {
            ctx.fillText(text, x, y);
          }
        }
      } else {
        const col = wmCol(position);
        const row = wmRow(position);
        ctx.textAlign = col === 0 ? 'left' : col === 2 ? 'right' : 'center';
        ctx.textBaseline = 'middle';
        const x = col === 0 ? pad : col === 2 ? w - pad : w / 2;
        const y = row === 0 ? pad + size / 2 : row === 2 ? h - pad - size / 2 : h / 2;
        ctx.fillText(text, x, y);
      }
    } else if (mode === 'logo' && logoImg) {
      const lw = Math.max(8, (w * logoScale) / 100);
      const lh = lw * (logoImg.naturalHeight / logoImg.naturalWidth);
      if (position === 'tile') {
        const stepX = lw * 1.9;
        const stepY = lh * 2.4;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.translate(-w / 2, -h / 2);
        for (let y = -diag / 2; y < h + diag / 2; y += stepY) {
          for (let x = -diag / 2; x < w + diag / 2; x += stepX) {
            ctx.drawImage(logoImg, x - lw / 2, y - lh / 2, lw, lh);
          }
        }
      } else {
        const col = wmCol(position);
        const row = wmRow(position);
        const x = col === 0 ? pad : col === 2 ? w - pad - lw : (w - lw) / 2;
        const y = row === 0 ? pad : row === 2 ? h - pad - lh : (h - lh) / 2;
        ctx.drawImage(logoImg, x, y, lw, lh);
      }
    }
    ctx.restore();
  };

  useEffect(() => {
    let cancelled = false;
    const preview = previewRef.current;
    if (!img || !preview) {
      setOutBlob(null);
      return;
    }
    const scale = Math.min(1, 1200 / img.naturalWidth);
    const pw = Math.max(1, Math.round(img.naturalWidth * scale));
    const ph = Math.max(1, Math.round(img.naturalHeight * scale));
    preview.width = pw;
    preview.height = ph;
    renderInto(preview.getContext('2d')!, pw, ph);

    const full = document.createElement('canvas');
    full.width = img.naturalWidth;
    full.height = img.naturalHeight;
    renderInto(full.getContext('2d')!, full.width, full.height);
    canvasToBlobP(full, format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92)
      .then((b) => {
        if (!cancelled) setOutBlob(b);
      })
      .catch(() => {
        if (!cancelled) setOutBlob(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, mode, text, fontPct, color, opacity, logoImg, logoScale, position, format]);

  return (
    <ImageCard
      tool={tool}
      note={s('watermarkNote')}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={pickFile} fileName={fileName} />
          </div>
          <SampleBtn onFile={pickFile} />
        </div>

        {error && <ErrorBox message={error} />}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              mode === 'text'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s('textWatermark')}
          </button>
          <button
            type="button"
            onClick={() => setMode('logo')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              mode === 'logo'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s('logoWatermark')}
          </button>
        </div>

        {mode === 'text' ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <OptLabel>{s('watermarkText')}</OptLabel>
              <OptInput value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div>
              <OptLabel>{s('textColor')}</OptLabel>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
                <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{color}</span>
              </div>
            </div>
            <div>
              <OptLabel>{s('textSizePctOfWidth').replace('{value}', String(fontPct))}</OptLabel>
              <input type="range" min={2} max={12} step={0.5} value={fontPct} onChange={(e) => setFontPct(parseFloat(e.target.value))} className="w-full accent-rose-600" />
            </div>
            <div>
              <OptLabel>{s('opacityLabel').replace('{value}', String(Math.round(opacity * 100)))}</OptLabel>
              <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-rose-600" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FileDrop onFile={pickLogo} label={s('dropLogoImage')} fileName={logoName} />
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <OptLabel>{s('logoSizePctOfWidth').replace('{value}', String(logoScale))}</OptLabel>
                <input type="range" min={5} max={40} step={1} value={logoScale} onChange={(e) => setLogoScale(parseInt(e.target.value, 10))} className="w-full accent-rose-600" />
              </div>
              <div>
                <OptLabel>{s('opacityLabel').replace('{value}', String(Math.round(opacity * 100)))}</OptLabel>
                <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-rose-600" />
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
          <div>
            <OptLabel>{s('position')}</OptLabel>
            <OptSelect value={position} onChange={(e) => setPosition(e.target.value as WmPosition)}>
              {WM_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {s(p.labelKey)}
                </option>
              ))}
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('downloadFormat')}</OptLabel>
            <OptSelect value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}>
              <option value="png">{s('pngLossless')}</option>
              <option value="jpeg">{s('jpgSmaller')}</option>
            </OptSelect>
          </div>
        </div>

        {img ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
              <canvas ref={previewRef} className="w-full h-auto block" />
            </div>
            <BlobDownloadBtn
              blob={outBlob}
              filename={`watermarked.${format === 'jpeg' ? 'jpg' : 'png'}`}
              label={format === 'jpeg' ? s('downloadFullResJpg') : s('downloadFullResPng')}
            />
          </div>
        ) : (
          <p className="text-xs font-semibold text-gray-500">{s('addPhotoForWatermark')}</p>
        )}
      </div>
    </ImageCard>
  );
};
