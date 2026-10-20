import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  JsonFormatter,
  JsonToCsv,
  CsvToJson,
  JsonToYaml,
  YamlToJson,
  JsonToTypescript,
  JsonDiffChecker,
  XmlFormatter,
  SqlFormatter,
} from './DevData';
import {
  JwtDecoder,
  Base64Tool,
  UrlEncoderDecoder,
  HtmlEntityTool,
  HashGenerator,
  PasswordGenerator,
  UuidGenerator,
  TimestampConverter,
  CronParser,
} from './DevEncoding';
import {
  RegexTester,
  ColorConverter,
  CssGradientGenerator,
  NumberBaseConverter,
  UrlParser,
  TextDiffChecker,
  HttpStatusReference,
  ChmodCalculator,
  UserAgentParser,
} from './DevWeb';

type ToolComponent = ComponentType<{ tool: ToolItem }>;

/** Slug → component registry for the Developer Tools suite. */
export const DEV_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  // Data formats
  'json-formatter': JsonFormatter,
  'json-to-csv-converter': JsonToCsv,
  'csv-to-json-converter': CsvToJson,
  'json-to-yaml-converter': JsonToYaml,
  'yaml-to-json-converter': YamlToJson,
  'json-to-typescript': JsonToTypescript,
  'json-diff-checker': JsonDiffChecker,
  'xml-formatter': XmlFormatter,
  'sql-formatter': SqlFormatter,
  // Encoding & security
  'jwt-decoder': JwtDecoder,
  'base64-encoder-decoder': Base64Tool,
  'url-encoder-decoder': UrlEncoderDecoder,
  'html-entity-encoder-decoder': HtmlEntityTool,
  'hash-generator': HashGenerator,
  'password-generator': PasswordGenerator,
  'uuid-generator': UuidGenerator,
  'timestamp-converter': TimestampConverter,
  'cron-expression-parser': CronParser,
  // Web utilities
  'regex-tester': RegexTester,
  'color-converter': ColorConverter,
  'css-gradient-generator': CssGradientGenerator,
  'number-base-converter': NumberBaseConverter,
  'url-parser': UrlParser,
  'text-diff-checker': TextDiffChecker,
  'http-status-code-reference': HttpStatusReference,
  'chmod-calculator': ChmodCalculator,
  'user-agent-parser': UserAgentParser,
};
