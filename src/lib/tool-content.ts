import type { SupportedLanguage } from './i18n';
import type { ToolItem } from './tools-data';
import { OVERVIEW_P1 } from './strings-chrome';
import { FAQ_PATTERN_I18N } from './faq-patterns-i18n';
import { OVERVIEWS_ES } from './overviews-es';
import { OVERVIEWS_FR } from './overviews-fr';
import { OVERVIEWS_AR } from './overviews-ar';
import { OVERVIEWS_RU } from './overviews-ru';

export interface FaqItem {
  question: string;
  answer: string;
}

const OVERVIEWS: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  es: OVERVIEWS_ES,
  fr: OVERVIEWS_FR,
  ar: OVERVIEWS_AR,
  ru: OVERVIEWS_RU
};

export { isGenerated, GEN_DESC, localizedGenDescription } from './gen-templates';
import { isGenerated } from './gen-templates';

/** The single overview template shared by all generated catalog entries. {name} = tool name. */
export const GEN_OVERVIEW: Record<SupportedLanguage, string> = {
  en: 'The Super Crown {name} provides seamless everyday utility for individuals, freelancers, and students. By keeping all calculations client-side inside your browser, we guarantee rapid results without server latency or tracking.',
  es: 'Super Crown {name} ofrece una utilidad diaria fluida para particulares, autónomos y estudiantes. Al mantener todos los cálculos en tu dispositivo, dentro de tu navegador, garantizamos resultados rápidos sin latencia de servidor ni rastreo.',
  fr: 'Super Crown {name} offre un utilitaire quotidien fluide pour les particuliers, les indépendants et les étudiants. Tous les calculs restant sur votre appareil, dans votre navigateur, nous garantissons des résultats rapides, sans latence serveur ni suivi.',
  ar: 'توفر أداة Super Crown {name} فائدة يومية سلسة للأفراد والمستقلين والطلاب. وبإبقاء جميع الحسابات على جهازك داخل متصفحك، نضمن نتائج سريعة دون تأخير الخادم أو التتبع.',
  ru: 'Super Crown {name} — удобный повседневный инструмент для частных лиц, фрилансеров и студентов. Поскольку все расчёты выполняются на вашем устройстве в браузере, мы гарантируем быстрые результаты без задержек сервера и отслеживания.'
};

/** The overview paragraph for a tool page in the given locale. */
export function localizedOverview(tool: ToolItem, lang: SupportedLanguage, localizedName: string): string {
  if (lang === 'en') {
    return tool.overviewContent || OVERVIEW_P1.en.replaceAll('{name}', tool.name);
  }
  if (isGenerated(tool)) {
    return GEN_OVERVIEW[lang].replaceAll('{name}', tool.name);
  }
  const translated = OVERVIEWS[lang]?.[tool.slug];
  if (translated) return translated;
  return OVERVIEW_P1[lang].replaceAll('{name}', localizedName);
}

/** A tool's FAQ list localized via the shared pattern tables (falls back per-item to English). */
export function localizedFaqs(tool: ToolItem, lang: SupportedLanguage, localizedName: string): FaqItem[] {
  const source = tool.faq || [];
  if (lang === 'en') return source;
  const maps = FAQ_PATTERN_I18N[lang];
  if (!maps) return source;
  const displayName = isGenerated(tool) ? tool.name : localizedName;
  return source.map((f) => {
    const qPattern = f.question.split(tool.name).join('{name}');
    const aPattern = f.answer.split(tool.name).join('{name}');
    const q = maps.q[qPattern];
    const a = maps.a[aPattern];
    return {
      question: q ? q.replaceAll('{name}', displayName) : f.question,
      answer: a ? a.replaceAll('{name}', displayName) : f.answer
    };
  });
}
