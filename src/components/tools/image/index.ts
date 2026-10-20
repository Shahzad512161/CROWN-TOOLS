import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  AiBackgroundRemover,
  ImageBackgroundChanger,
  QrCodeGenerator,
  QrCodeScanner,
  MemeGenerator,
  ImageOcr,
  PassportPhotoMaker,
  FaviconGenerator,
  ImageWatermark,
} from './ImageStudioA';
import {
  ColorPaletteExtractor,
  ProfilePictureMaker,
  ImageCollageMaker,
  ImageSplitter,
  ImageColorPicker,
  PhotoFilterEditor,
  SvgToPng,
  ImageToAscii,
  ImageBase64,
} from './ImageStudioB';

type ToolComponent = ComponentType<{ tool: ToolItem }>;

/** Slug → component registry for the Image studio suite (round 2). */
export const IMAGE_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  'background-remover': AiBackgroundRemover,
  'image-background-changer': ImageBackgroundChanger,
  'qr-code-generator': QrCodeGenerator,
  'qr-code-scanner': QrCodeScanner,
  'meme-generator': MemeGenerator,
  'image-to-text-ocr': ImageOcr,
  'passport-photo-maker': PassportPhotoMaker,
  'favicon-generator': FaviconGenerator,
  'image-watermark': ImageWatermark,
  'color-palette-extractor': ColorPaletteExtractor,
  'profile-picture-maker': ProfilePictureMaker,
  'image-collage-maker': ImageCollageMaker,
  'image-splitter': ImageSplitter,
  'image-color-picker': ImageColorPicker,
  'photo-filter-editor': PhotoFilterEditor,
  'svg-to-png-converter': SvgToPng,
  'image-to-ascii-art': ImageToAscii,
  // Replaces the old generic-shell version with a real encoder
  'image-base64-encoder': ImageBase64,
};
