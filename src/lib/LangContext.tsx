import React, { createContext, useContext } from 'react';
import type { SupportedLanguage } from './i18n';

/**
 * Language context — App provides the current locale once; every tool
 * component reads it with useLang() instead of prop-drilling.
 */
export const LangContext = createContext<SupportedLanguage>('en');

export function useLang(): SupportedLanguage {
  return useContext(LangContext);
}

/** A string dictionary: key -> per-locale text. */
export type StrDict = Record<string, Record<SupportedLanguage, string>>;

/** Look up a key in a dictionary for the current language (falls back to English). */
export function useStrings(dict: StrDict) {
  const lang = useLang();
  return (key: string): string => dict[key]?.[lang] ?? dict[key]?.en ?? key;
}

/** Non-hook lookup for use outside components. */
export function lookup(dict: StrDict, lang: SupportedLanguage, key: string): string {
  return dict[key]?.[lang] ?? dict[key]?.en ?? key;
}

/**
 * Shared UI strings used across all tool suites (dropzones, buttons,
 * results, errors). Suites keep their own specific strings in
 * src/lib/strings/<suite>.ts and reuse these for the common parts.
 */
export const COMMON: StrDict = {
  dropFilesHere: { en: 'Drop files here or', es: 'Suelta los archivos aquí o', fr: 'Déposez les fichiers ici ou', ar: 'أسقط الملفات هنا أو', ru: 'Перетащите файлы сюда или' },
  browseFiles: { en: 'browse files', es: 'elige archivos', fr: 'parcourez vos fichiers', ar: 'تصفح الملفات', ru: 'выберите файлы' },
  processing: { en: 'Processing…', es: 'Procesando…', fr: 'Traitement…', ar: 'جارٍ المعالجة…', ru: 'Обработка…' },
  pleaseWait: { en: 'Please wait…', es: 'Espera…', fr: 'Veuillez patienter…', ar: 'يرجى الانتظار…', ru: 'Подождите…' },
  working: { en: 'Working…', es: 'Trabajando…', fr: 'En cours…', ar: 'جارٍ العمل…', ru: 'Работаем…' },
  download: { en: 'Download', es: 'Descargar', fr: 'Télécharger', ar: 'تنزيل', ru: 'Скачать' },
  downloadAll: { en: 'Download all', es: 'Descargar todo', fr: 'Tout télécharger', ar: 'تنزيل الكل', ru: 'Скачать все' },
  copy: { en: 'Copy', es: 'Copiar', fr: 'Copier', ar: 'نسخ', ru: 'Копировать' },
  copied: { en: 'Copied!', es: '¡Copiado!', fr: 'Copié !', ar: 'تم النسخ!', ru: 'Скопировано!' },
  clear: { en: 'Clear', es: 'Borrar', fr: 'Effacer', ar: 'مسح', ru: 'Очистить' },
  clearAll: { en: 'Clear all', es: 'Borrar todo', fr: 'Tout effacer', ar: 'مسح الكل', ru: 'Очистить все' },
  reset: { en: 'Reset', es: 'Restablecer', fr: 'Réinitialiser', ar: 'إعادة تعيين', ru: 'Сбросить' },
  calculate: { en: 'Calculate', es: 'Calcular', fr: 'Calculer', ar: 'احسب', ru: 'Рассчитать' },
  convert: { en: 'Convert', es: 'Convertir', fr: 'Convertir', ar: 'حوّل', ru: 'Конвертировать' },
  generate: { en: 'Generate', es: 'Generar', fr: 'Générer', ar: 'إنشاء', ru: 'Сгенерировать' },
  results: { en: 'Results', es: 'Resultados', fr: 'Résultats', ar: 'النتائج', ru: 'Результаты' },
  result: { en: 'Result', es: 'Resultado', fr: 'Résultat', ar: 'النتيجة', ru: 'Результат' },
  error: { en: 'Something went wrong', es: 'Algo salió mal', fr: 'Une erreur est survenue', ar: 'حدث خطأ ما', ru: 'Что-то пошло не так' },
  tryAgain: { en: 'Try again', es: 'Intentar de nuevo', fr: 'Réessayer', ar: 'حاول مرة أخرى', ru: 'Попробовать снова' },
  addFiles: { en: 'Add files', es: 'Añadir archivos', fr: 'Ajouter des fichiers', ar: 'إضافة ملفات', ru: 'Добавить файлы' },
  remove: { en: 'Remove', es: 'Eliminar', fr: 'Retirer', ar: 'إزالة', ru: 'Удалить' },
  fileName: { en: 'Name', es: 'Nombre', fr: 'Nom', ar: 'الاسم', ru: 'Имя' },
  fileSize: { en: 'Size', es: 'Tamaño', fr: 'Taille', ar: 'الحجم', ru: 'Размер' },
  pages: { en: 'Pages', es: 'Páginas', fr: 'Pages', ar: 'الصفحات', ru: 'Страниц' },
  page: { en: 'Page', es: 'Página', fr: 'Page', ar: 'صفحة', ru: 'Страница' },
  of: { en: 'of', es: 'de', fr: 'sur', ar: 'من', ru: 'из' },
  start: { en: 'Start', es: 'Iniciar', fr: 'Démarrer', ar: 'ابدأ', ru: 'Старт' },
  stop: { en: 'Stop', es: 'Detener', fr: 'Arrêter', ar: 'إيقاف', ru: 'Стоп' },
  play: { en: 'Play', es: 'Reproducir', fr: 'Lire', ar: 'تشغيل', ru: 'Играть' },
  pause: { en: 'Pause', es: 'Pausar', fr: 'Pause', ar: 'إيقاف مؤقت', ru: 'Пауза' },
  record: { en: 'Record', es: 'Grabar', fr: 'Enregistrer', ar: 'تسجيل', ru: 'Запись' },
  upload: { en: 'Upload', es: 'Subir', fr: 'Importer', ar: 'رفع', ru: 'Загрузить' },
  selectFile: { en: 'Select a file', es: 'Selecciona un archivo', fr: 'Sélectionnez un fichier', ar: 'اختر ملفًا', ru: 'Выберите файл' },
  noFileSelected: { en: 'No file selected', es: 'Ningún archivo seleccionado', fr: 'Aucun fichier sélectionné', ar: 'لم يتم اختيار ملف', ru: 'Файл не выбран' },
  ready: { en: 'Ready', es: 'Listo', fr: 'Prêt', ar: 'جاهز', ru: 'Готово' },
  done: { en: 'Done', es: 'Hecho', fr: 'Terminé', ar: 'تم', ru: 'Готово' },
  save: { en: 'Save', es: 'Guardar', fr: 'Enregistrer', ar: 'حفظ', ru: 'Сохранить' },
  cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', ar: 'إلغاء', ru: 'Отмена' },
  close: { en: 'Close', es: 'Cerrar', fr: 'Fermer', ar: 'إغلاق', ru: 'Закрыть' },
  width: { en: 'Width', es: 'Ancho', fr: 'Largeur', ar: 'العرض', ru: 'Ширина' },
  height: { en: 'Height', es: 'Alto', fr: 'Hauteur', ar: 'الارتفاع', ru: 'Высота' },
  quality: { en: 'Quality', es: 'Calidad', fr: 'Qualité', ar: 'الجودة', ru: 'Качество' },
  format: { en: 'Format', es: 'Formato', fr: 'Format', ar: 'التنسيق', ru: 'Формат' },
  input: { en: 'Input', es: 'Entrada', fr: 'Entrée', ar: 'الإدخال', ru: 'Ввод' },
  output: { en: 'Output', es: 'Salida', fr: 'Résultat', ar: 'الإخراج', ru: 'Вывод' },
  options: { en: 'Options', es: 'Opciones', fr: 'Options', ar: 'خيارات', ru: 'Параметры' },
  preview: { en: 'Preview', es: 'Vista previa', fr: 'Aperçu', ar: 'معاينة', ru: 'Предпросмотр' },
  original: { en: 'Original', es: 'Original', fr: 'Original', ar: 'الأصلي', ru: 'Оригинал' },
  total: { en: 'Total', es: 'Total', fr: 'Total', ar: 'المجموع', ru: 'Итого' },
  yourText: { en: 'Your text', es: 'Tu texto', fr: 'Votre texte', ar: 'النص الخاص بك', ru: 'Ваш текст' },
  enterText: { en: 'Type or paste here…', es: 'Escribe o pega aquí…', fr: 'Saisissez ou collez ici…', ar: 'اكتب أو الصق هنا…', ru: 'Введите или вставьте сюда…' },
};

export const LangProvider = LangContext.Provider;
