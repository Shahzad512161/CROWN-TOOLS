import type { SupportedLanguage } from './i18n';
import type { ToolItem } from './tools-data';

/**
 * Templates for the catalog-generated entries (id 'gen-…'). Kept in this
 * tiny module so card rendering (HomePage) can localize generated entries
 * without pulling the full overview/FAQ data into the initial bundle.
 */

/** Catalog-generated entries (id 'gen-…') share templated content. */
export function isGenerated(tool: ToolItem): boolean {
  return String(tool.id).startsWith('gen-');
}

/** The single description template shared by all generated catalog entries. {lower} = lowercase tool name. */
export const GEN_DESC: Record<SupportedLanguage, string> = {
  en: 'Accurate, free online {lower} designed for USA, UK, and Canadian users. 100% legal, fast, and privacy-protected.',
  es: 'Accede gratis en línea a {lower}, pensado para usuarios de EE. UU., Reino Unido y Canadá. 100% legal, rápido y con tu privacidad protegida.',
  fr: 'Accédez gratuitement en ligne à {lower}, conçu pour les utilisateurs des États-Unis, du Royaume-Uni et du Canada. 100 % légal, rapide et respectueux de votre vie privée.',
  ar: 'استخدم {lower} مجانًا عبر الإنترنت، مصمم للمستخدمين في الولايات المتحدة والمملكة المتحدة وكندا. قانوني 100% وسريع ويحمي خصوصيتك.',
  ru: 'Бесплатный и точный онлайн-инструмент {lower} для пользователей из США, Великобритании и Канады. 100% легально, быстро и с защитой приватности.'
};

/** Localized card description for generated catalog entries; null for curated tools. */
export function localizedGenDescription(tool: ToolItem, lang: SupportedLanguage): string | null {
  if (!isGenerated(tool)) return null;
  return GEN_DESC[lang].replace('{lower}', tool.name.toLowerCase());
}
