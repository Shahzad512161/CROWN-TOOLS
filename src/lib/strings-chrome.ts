import type { StrDict } from './LangContext';
import type { SupportedLanguage } from './i18n';
import type { Translations } from './i18n';

/** Tool-page chrome strings (ToolWrapper) in all five locales. {name} is replaced with the localized tool name. */
export const CHROME: StrDict = {
  crumbTools: { en: '250+ Tools', es: 'Más de 250 herramientas', fr: 'Plus de 250 outils', ar: 'أكثر من 250 أداة', ru: 'Более 250 инструментов' },
  shareBtn: { en: 'Share', es: 'Compartir', fr: 'Partager', ar: 'مشاركة', ru: 'Поделиться' },
  copiedLink: { en: 'Copied', es: 'Copiado', fr: 'Copié', ar: 'تم النسخ', ru: 'Скопировано' },
  shareTitle: { en: 'Copy shareable link to this unlocked tool', es: 'Copiar el enlace de esta herramienta', fr: 'Copier le lien de cet outil', ar: 'انسخ رابط هذه الأداة', ru: 'Скопировать ссылку на этот инструмент' },
  unlockedFreeBadge: { en: '100% Unlocked & Free', es: '100% desbloqueado y gratis', fr: '100 % débloqué et gratuit', ar: 'مفتوح ومجاني 100%', ru: '100% открыто и бесплатно' },
  instantBrowser: { en: 'Instant In-Browser Execution', es: 'Ejecución instantánea en el navegador', fr: 'Exécution instantanée dans le navigateur', ar: 'تنفيذ فوري داخل المتصفح', ru: 'Мгновенная работа в браузере' },
  workspaceLabel: { en: 'Interactive Tool Workspace', es: 'Espacio de trabajo interactivo', fr: 'Espace de travail interactif', ar: 'مساحة عمل الأداة التفاعلية', ru: 'Интерактивная рабочая область' },
  workspaceNote: { en: 'Client-side • Zero Data Retention', es: 'En tu dispositivo • Sin guardar datos', fr: 'Côté client • Aucune donnée conservée', ar: 'على جهازك • لا يتم حفظ أي بيانات', ru: 'На вашем устройстве • Данные не сохраняются' },
  aboutHeading: { en: 'About {name} & How It Works', es: 'Acerca de {name} y cómo funciona', fr: 'À propos de {name} et son fonctionnement', ar: 'حول {name} وكيفية عمله', ru: 'Об инструменте {name} и как он работает' },
  overviewTag: { en: '150-Word Overview', es: 'Resumen de 150 palabras', fr: 'Aperçu en 150 mots', ar: 'نظرة عامة من 150 كلمة', ru: 'Обзор в 150 слов' },
  overviewP2: {
    en: 'Every computation is performed using verified standard formulas (such as standard amortization algorithms, IRS-aligned tax tables, WHO health index metrics, or ISO standard conversion matrices). Because all computations execute entirely client-side using modern web technologies, your sensitive numbers and financial entries remain strictly confined to your device memory with zero server logging or tracking.',
    es: 'Cada cálculo se realiza con fórmulas estándar verificadas (como algoritmos estándar de amortización, tablas fiscales alineadas con el IRS, indicadores de salud de la OMS o matrices de conversión ISO). Como todo se ejecuta en tu dispositivo con tecnologías web modernas, tus cifras y datos financieros permanecen solo en la memoria de tu equipo, sin registro ni rastreo en servidores.',
    fr: 'Chaque calcul utilise des formules standard vérifiées (algorithmes d’amortissement standard, barèmes fiscaux alignés sur l’IRS, indices de santé de l’OMS ou matrices de conversion ISO). Tout s’exécutant entièrement sur votre appareil grâce aux technologies web modernes, vos chiffres et données financières restent dans la mémoire de votre appareil, sans journalisation ni suivi sur des serveurs.',
    ar: 'يتم كل حساب باستخدام صيغ قياسية موثقة (مثل خوارزميات الاستهلاك القياسية، وجداول الضرائب المتوافقة مع مصلحة الضرائب الأمريكية، ومؤشرات الصحة لمنظمة الصحة العالمية، ومصفوفات التحويل ISO). ولأن كل شيء يعمل بالكامل على جهازك بتقنيات الويب الحديثة، تبقى أرقامك وبياناتك المالية في ذاكرة جهازك فقط، دون أي تسجيل أو تتبع على الخوادم.',
    ru: 'Каждый расчёт выполняется по проверенным стандартным формулам (стандартные алгоритмы амортизации, налоговые таблицы IRS, показатели здоровья ВОЗ, матрицы конвертации ISO). Поскольку всё выполняется полностью на вашем устройстве с помощью современных веб-технологий, ваши цифры и финансовые данные остаются только в памяти устройства   без записи и отслеживания на серверах.'
  },
  guideTeaser: {
    en: 'Want the full mathematical derivation, edge-case analysis, and expert tips?',
    es: '¿Quieres la derivación matemática completa, el análisis de casos límite y consejos de expertos?',
    fr: 'Vous voulez la dérivation mathématique complète, l’analyse des cas limites et les conseils d’experts ?',
    ar: 'هل تريد الاشتقاق الرياضي الكامل وتحليل الحالات الخاصة ونصائح الخبراء؟',
    ru: 'Хотите полное математическое обоснование, разбор крайних случаев и советы экспертов?'
  },
  trustHeading: { en: 'Guaranteed Legit & Safe', es: 'Legítimo y seguro, garantizado', fr: 'Légitime et sûr, garanti', ar: 'مشروع وآمن ومضمون', ru: 'Легально и безопасно   гарантия' },
  trust1: { en: '100% Unlocked   No Login Required', es: '100% desbloqueado   Sin iniciar sesión', fr: '100 % débloqué   Aucune connexion requise', ar: 'مفتوح 100%   لا حاجة لتسجيل الدخول', ru: '100% открыто   вход не требуется' },
  trust2: { en: 'Zero Server Logging   Private to You', es: 'Sin registros en servidores   Privado', fr: 'Aucun journal serveur   Privé', ar: 'لا تسجيل على الخوادم   خاص بك', ru: 'Без записи на серверах   приватно' },
  trust3: { en: 'No Piracy or Copyrighted Media Ripping', es: 'Sin piratería ni copias de medios protegidos', fr: 'Aucun piratage ni copie de médias protégés', ar: 'لا قرصنة ولا نسخ وسائط محمية', ru: 'Без пиратства и копирования защищённых медиа' },
  trust4: { en: 'Fully AdSense & GDPR Compliant', es: 'Totalmente compatible con AdSense y el RGPD', fr: 'Entièrement conforme à AdSense et au RGPD', ar: 'متوافق تمامًا مع AdSense واللائحة العامة لحماية البيانات', ru: 'Полное соответствие AdSense и GDPR' },
  guideCardTitle: { en: 'Detailed 800-Word Guide Available', es: 'Guía detallada de 800 palabras disponible', fr: 'Guide détaillé de 800 mots disponible', ar: 'دليل مفصل من 800 كلمة متاح', ru: 'Доступно подробное руководство на 800 слов' },
  guideCardText: {
    en: 'Read our in-depth educational article explaining formulas, step-by-step applications, and common pitfalls.',
    es: 'Lee nuestro artículo educativo en profundidad con fórmulas, aplicaciones paso a paso y errores comunes.',
    fr: 'Lisez notre article éducatif approfondi : formules, applications pas à pas et pièges courants.',
    ar: 'اقرأ مقالنا التعليمي المتعمق الذي يشرح الصيغ والتطبيقات خطوة بخطوة والأخطاء الشائعة.',
    ru: 'Читайте нашу подробную обучающую статью: формулы, пошаговое применение и частые ошибки.'
  },
  relatedHeading: { en: 'Related {category}', es: '{category} relacionados', fr: '{category} associés', ar: '{category} ذات الصلة', ru: 'Похожие: {category}' },
  adAbove: { en: 'Advertisement', es: 'Publicidad', fr: 'Publicité', ar: 'إعلان', ru: 'Реклама' },
  notFoundTitle: { en: 'Page not found', es: 'Página no encontrada', fr: 'Page introuvable', ar: 'الصفحة غير موجودة', ru: 'Страница не найдена' },
  notFoundText: {
    en: 'The page you are looking for does not exist or may have been moved. Browse the tools directory instead   everything is free and unlocked.',
    es: 'La página que buscas no existe o puede haber sido movida. Explora el directorio de herramientas: todo es gratis y está desbloqueado.',
    fr: 'La page que vous cherchez n’existe pas ou a peut-être été déplacée. Parcourez plutôt le répertoire d’outils   tout est gratuit et débloqué.',
    ar: 'الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها. تصفح دليل الأدوات بدلاً من ذلك   كل شيء مجاني ومفتوح.',
    ru: 'Страница, которую вы ищете, не существует или была перемещена. Вместо этого откройте каталог инструментов   всё бесплатно и открыто.'
  },
  backHomeBtn: { en: 'Back to all tools', es: 'Volver a las herramientas', fr: 'Retour aux outils', ar: 'العودة إلى الأدوات', ru: 'Назад к инструментам' },
  faqBadge: { en: 'FAQ • 4 Answers', es: 'FAQ • 4 respuestas', fr: 'FAQ • 4 réponses', ar: 'الأسئلة الشائعة • 4 إجابات', ru: 'FAQ • 4 ответа' },
  faqHeading: { en: 'Frequently Asked Questions about {name}', es: 'Preguntas frecuentes sobre {name}', fr: 'Questions fréquentes sur {name}', ar: 'الأسئلة الشائعة حول {name}', ru: 'Частые вопросы об инструменте {name}' },
  faqSub: {
    en: 'Common questions answered by our editorial team for users worldwide.',
    es: 'Preguntas comunes respondidas por nuestro equipo editorial para usuarios de todo el mundo.',
    fr: 'Questions courantes traitées par notre équipe éditoriale pour les utilisateurs du monde entier.',
    ar: 'أسئلة شائعة يجيب عنها فريق التحرير لدينا للمستخدمين حول العالم.',
    ru: 'Частые вопросы с ответами нашей редакции для пользователей по всему миру.'
  }
};

/** Fallback overview paragraph (used when a tool has no custom overview). {name} = localized tool name. */
export const OVERVIEW_P1: Record<SupportedLanguage, string> = {
  en: 'The Super Crown {name} is engineered to provide precise, institutional-grade calculation support directly inside your web browser. Built specifically for homeowners, students, freelancers, and working professionals across the USA, UK, Canada, and Europe, this utility completely eliminates manual math errors, subscription paywalls, and intrusive software downloads.',
  es: 'Super Crown {name} está diseñado para ofrecerte cálculos precisos de nivel profesional directamente en tu navegador. Creado para propietarios, estudiantes, autónomos y profesionales de EE. UU., Reino Unido, Canadá y Europa, elimina por completo los errores de cálculo manual, los muros de pago por suscripción y las descargas de software intrusivas.',
  fr: 'Super Crown {name} est conçu pour fournir des calculs précis de niveau professionnel directement dans votre navigateur. Pensé pour les propriétaires, étudiants, indépendants et professionnels des États-Unis, du Royaume-Uni, du Canada et d’Europe, il élimine totalement les erreurs de calcul manuel, les abonnements payants et les téléchargements de logiciels intrusifs.',
  ar: 'صُممت أداة Super Crown {name} لتقديم حسابات دقيقة بمستوى احترافي مباشرة داخل متصفحك. وهي موجهة لأصحاب المنازل والطلاب والمستقلين والمهنيين في الولايات المتحدة والمملكة المتحدة وكندا وأوروبا، وتقضي تمامًا على أخطاء الحساب اليدوي وجدران الدفع بالاشتراك وتنزيلات البرامج المزعجة.',
  ru: 'Super Crown {name} создан для точных расчётов профессионального уровня прямо в вашем браузере. Инструмент для домовладельцев, студентов, фрилансеров и специалистов из США, Великобритании, Канады и Европы полностью исключает ошибки ручных расчётов, платные подписки и навязчивые загрузки программ.'
};

/** The 4 default FAQ templates shown on every tool page. {name} = localized tool name. */
export const FAQ_TEMPLATES: Record<SupportedLanguage, { question: string; answer: string }[]> = {
  en: [
    { question: 'Is the {name} on Super Crown completely free to use?', answer: 'Yes, 100%. The {name} on Free Omni Tools is completely unlocked and free for everyone worldwide. There are no registrations, no subscription paywalls, no software downloads, and no credit card required.' },
    { question: 'Does the {name} save or upload my sensitive personal data?', answer: 'No. Privacy and security are our highest priorities. All calculations and inputs within the {name} process 100% locally on your device inside your web browser. Nothing is ever sent to or stored on remote servers.' },
    { question: 'How accurate and compliant are the calculations for USA & international standards?', answer: 'All formulas and math logic used in the {name} are built in accordance with standard US and international computational benchmarks (e.g., standard amortization algorithms, IRS guidelines, WHO health formulas, and ISO unit tables).' },
    { question: 'Can I export, print, or share the results from this tool?', answer: 'Yes. You can instantly copy results to your device clipboard with one click, print formatted summary sheets via your browser\'s Print dialog, or bookmark the tool for daily recurring use.' }
  ],
  es: [
    { question: '¿{name} de Super Crown es completamente gratis?', answer: 'Sí, 100%. {name} en Free Omni Tools está completamente desbloqueado y es gratis para todo el mundo. Sin registros, sin muros de pago por suscripción, sin descargas de software y sin tarjeta de crédito.' },
    { question: '¿{name} guarda o sube mis datos personales sensibles?', answer: 'No. La privacidad y la seguridad son nuestra máxima prioridad. Todos los cálculos y datos de {name} se procesan 100% en local, en tu dispositivo y dentro de tu navegador. Nunca se envía ni se guarda nada en servidores remotos.' },
    { question: '¿Qué tan precisos y conformes son los cálculos con los estándares de EE. UU. e internacionales?', answer: 'Todas las fórmulas y la lógica de {name} siguen los estándares de cálculo estadounidenses e internacionales (por ejemplo, algoritmos estándar de amortización, directrices del IRS, fórmulas de salud de la OMS y tablas de unidades ISO).' },
    { question: '¿Puedo exportar, imprimir o compartir los resultados de esta herramienta?', answer: 'Sí. Puedes copiar los resultados al portapapeles con un clic, imprimir resúmenes con formato desde el diálogo de impresión de tu navegador o guardar la herramienta en favoritos para usarla a diario.' }
  ],
  fr: [
    { question: '{name} sur Super Crown est-il entièrement gratuit ?', answer: 'Oui, à 100 %. {name} sur Free Omni Tools est entièrement débloqué et gratuit pour tout le monde. Aucune inscription, aucun abonnement payant, aucun téléchargement de logiciel et aucune carte bancaire requise.' },
    { question: '{name} enregistre-t-il ou envoie-t-il mes données personnelles sensibles ?', answer: 'Non. La confidentialité et la sécurité sont nos priorités absolues. Tous les calculs et toutes les saisies dans {name} sont traités à 100 % localement, sur votre appareil et dans votre navigateur. Rien n’est jamais envoyé ni stocké sur des serveurs distants.' },
    { question: 'Quelle est la précision des calculs par rapport aux standards américains et internationaux ?', answer: 'Toutes les formules et la logique de {name} respectent les standards de calcul américains et internationaux (algorithmes d’amortissement standard, directives de l’IRS, formules de santé de l’OMS et tables d’unités ISO).' },
    { question: 'Puis-je exporter, imprimer ou partager les résultats de cet outil ?', answer: 'Oui. Vous pouvez copier les résultats dans le presse-papiers en un clic, imprimer des récapitulatifs formatés via la boîte d’impression de votre navigateur, ou ajouter l’outil à vos favoris pour un usage quotidien.' }
  ],
  ar: [
    { question: 'هل أداة {name} على Super Crown مجانية تمامًا؟', answer: 'نعم، 100%. أداة {name} على Free Omni Tools مفتوحة بالكامل ومجانية للجميع حول العالم. لا تسجيل، ولا جدران دفع بالاشتراك، ولا تنزيل برامج، ولا حاجة لبطاقة ائتمان.' },
    { question: 'هل تحفظ أداة {name} بياناتي الشخصية الحساسة أو ترفعها؟', answer: 'لا. الخصوصية والأمان هما أولويتنا القصوى. تتم جميع الحسابات والإدخالات داخل {name} بنسبة 100% محليًا على جهازك وداخل متصفحك. لا يتم إرسال أي شيء أو حفظه على خوادم خارجية أبدًا.' },
    { question: 'ما مدى دقة الحسابات وتوافقها مع المعايير الأمريكية والدولية؟', answer: 'تتبع جميع الصيغ والمنطق الحسابي في {name} المعايير الأمريكية والدولية المعتمدة (مثل خوارزميات الاستهلاك القياسية وإرشادات مصلحة الضرائب الأمريكية وصيغ الصحة لمنظمة الصحة العالمية وجداول وحدات ISO).' },
    { question: 'هل يمكنني تصدير نتائج هذه الأداة أو طباعتها أو مشاركتها؟', answer: 'نعم. يمكنك نسخ النتائج إلى الحافظة بنقرة واحدة، أو طباعة ملخصات منسقة عبر مربع الطباعة في المتصفح، أو حفظ الأداة في المفضلة للاستخدام اليومي.' }
  ],
  ru: [
    { question: 'Инструмент {name} на Super Crown полностью бесплатный?', answer: 'Да, на 100%. {name} на Free Omni Tools полностью открыт и бесплатен для всех по всему миру. Без регистрации, без платных подписок, без загрузки программ и без банковской карты.' },
    { question: 'Сохраняет ли {name} мои конфиденциальные личные данные?', answer: 'Нет. Приватность и безопасность   наш главный приоритет. Все расчёты и вводы в {name} обрабатываются на 100% локально, на вашем устройстве и в вашем браузере. Ничего никогда не отправляется и не хранится на удалённых серверах.' },
    { question: 'Насколько точны расчёты и соответствуют ли они стандартам США и международным стандартам?', answer: 'Все формулы и логика {name} построены по стандартным американским и международным вычислительным эталонам (стандартные алгоритмы амортизации, рекомендации IRS, формулы здоровья ВОЗ и таблицы единиц ISO).' },
    { question: 'Можно ли экспортировать, распечатать или поделиться результатами этого инструмента?', answer: 'Да. Вы можете мгновенно скопировать результаты в буфер обмена в один клик, распечатать оформленные сводки через диалог печати браузера или добавить инструмент в закладки для ежедневного использования.' }
  ]
};

/** Map the English category name stored in tools-data to its i18n dictionary key. */
const CATEGORY_KEYS: Record<string, keyof Translations> = {
  'Daily Calculators': 'catDailyCalc',
  'Text & AI Tools': 'catTextAi',
  'Unit Converters': 'catUnitConv',
  'PDF Tools': 'catPdfTools',
  'Image Tools': 'catImageTools',
  'Home & Daily Life': 'catHomeLife',
  'Word Tools': 'catWordTools',
  'SEO Tools': 'catSeoTools',
  'Developer Tools': 'catDevTools',
  'Video & Audio Tools': 'catMediaTools',
  'AI Tools': 'catAiTools',
  'Social Media Tools': 'catSocialTools',
  'Student & Everyday Tools': 'catStudentTools'
};

export function localizedCategory(category: string, t: Translations): string {
  const key = CATEGORY_KEYS[category];
  return key ? t[key] : category;
}
