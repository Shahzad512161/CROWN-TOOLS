import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  VideoToGif,
  VideoCompressor,
  VideoTrimmer,
  VideoConverter,
  VideoToMp3,
  VideoFrameCapture,
  AudioConverter,
  AudioTrimmer,
} from './MediaStudioA';
import {
  AudioJoiner,
  AudioVolumeBooster,
  AudioSpeedChanger,
  ScreenRecorder,
  WebcamRecorder,
  VoiceRecorder,
  TextToSpeech,
  SpeechToText,
} from './MediaStudioB';

type ToolComponent = ComponentType<{ tool: ToolItem }>;

/** Slug → component registry for the Video & Audio suite. */
export const MEDIA_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  'video-to-gif': VideoToGif,
  'video-compressor': VideoCompressor,
  'video-trimmer': VideoTrimmer,
  'video-converter': VideoConverter,
  'video-to-mp3': VideoToMp3,
  'video-frame-capture': VideoFrameCapture,
  'audio-converter': AudioConverter,
  'audio-trimmer': AudioTrimmer,
  'audio-joiner': AudioJoiner,
  'audio-volume-booster': AudioVolumeBooster,
  'audio-speed-changer': AudioSpeedChanger,
  'screen-recorder': ScreenRecorder,
  'webcam-recorder': WebcamRecorder,
  'voice-recorder': VoiceRecorder,
  'text-to-speech': TextToSpeech,
  'speech-to-text': SpeechToText,
};
