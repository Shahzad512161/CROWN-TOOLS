// ============================================================
// Free Omni Tools   AI client (Google Gemini)
// Shared by the AI Tools suite and the PDF AI tools' pattern:
// the site owner supplies a free Gemini API key via the
// VITE_GEMINI_API_KEY env var; visitors' prompts go from their
// browser directly to Google. No key → tools show setup help.
// ============================================================
import { GoogleGenAI } from '@google/genai';

export const AI_TEXT_MODEL = 'gemini-2.5-flash';
export const AI_IMAGE_MODEL = 'gemini-2.5-flash-image';

export function getGeminiKey(): string {
  return ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY as string) || '';
}

export function hasGeminiKey(): boolean {
  return getGeminiKey().length > 0;
}

function friendlyError(e: unknown): Error {
  const raw = e instanceof Error ? e.message : String(e);
  if (/api key not valid|API_KEY_INVALID|invalid api key/i.test(raw)) {
    return new Error('The configured Gemini API key is invalid. The site owner should check the VITE_GEMINI_API_KEY value.');
  }
  if (/quota|rate limit|429|RESOURCE_EXHAUSTED/i.test(raw)) {
    return new Error('The Gemini API quota or rate limit was hit. Wait a moment and try again, or the site owner can check quota in Google AI Studio.');
  }
  if (/SAFETY|blocked|harm/i.test(raw)) {
    return new Error('Gemini declined to answer that prompt (safety filters). Try rephrasing it.');
  }
  if (/fetch|network|Failed to fetch/i.test(raw)) {
    return new Error('Could not reach the Gemini API   check your internet connection and try again.');
  }
  return new Error(raw || 'The AI request failed. Please try again.');
}

export interface AiTextOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
}

/** Generate text with Gemini. Throws friendly Errors. */
export async function aiText(prompt: string, opts: AiTextOptions = {}): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('No Gemini API key is configured for this site.');
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = (await ai.models.generateContent({
      model: opts.model || AI_TEXT_MODEL,
      contents: prompt,
      config: {
        ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts.maxOutputTokens !== undefined ? { maxOutputTokens: opts.maxOutputTokens } : {}),
        ...(opts.systemInstruction ? { systemInstruction: opts.systemInstruction } : {}),
      },
    })) as { text?: string };
    const text = res?.text ?? '';
    if (!text.trim()) throw new Error('The AI returned an empty response. Please try again.');
    return text;
  } catch (e) {
    throw friendlyError(e);
  }
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
}

/** Multi-turn chat with Gemini (history in Gemini's user/model format). */
export async function aiChat(history: AiChatMessage[], systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('No Gemini API key is configured for this site.');
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = (await ai.models.generateContent({
      model: AI_TEXT_MODEL,
      contents: history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      config: systemInstruction ? { systemInstruction } : {},
    })) as { text?: string };
    const text = res?.text ?? '';
    if (!text.trim()) throw new Error('The AI returned an empty response. Please try again.');
    return text;
  } catch (e) {
    throw friendlyError(e);
  }
}

/** Generate an image with Gemini's image model. Returns a data URL. */
export async function aiImage(prompt: string): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('No Gemini API key is configured for this site.');
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = (await ai.models.generateContent({
      model: AI_IMAGE_MODEL,
      contents: prompt,
    })) as { candidates?: { content?: { parts?: { text?: string; inlineData?: { data: string; mimeType: string } }[] } }[] };
    const parts = res?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    const textPart = parts.find((p) => p.text)?.text;
    throw new Error(textPart ? `The image model replied with text instead of an image: ${textPart.slice(0, 200)}` : 'The image model returned no image. Try a different prompt.');
  } catch (e) {
    throw friendlyError(e);
  }
}
