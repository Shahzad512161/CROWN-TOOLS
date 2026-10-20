/** French catalog translations (tool names + descriptions), keyed by slug. */
import type { ToolItem } from './tools-data';
import type { SupportedLanguage } from './i18n';
import { TOOLS_AR } from './tools-ar';
import { TOOLS_RU } from './tools-ru';
import { TOOLS_ES } from './tools-es';
import { localizedGenDescription } from './gen-templates';

export const TOOLS_FR: Record<string, { name: string; description: string }> = {
 "auto-insurance-calculator": {
  "description": "Estimez vos primes d'assurance auto aux États-Unis et au Royaume-Uni selon le type de véhicule, l'âge du conducteur, l'État américain, les limites de couverture et la franchise.",
  "name": "Estimateur d'assurance auto"
 },
 "background-remover": {
  "description": "Supprimez l'arrière-plan de n'importe quelle photo grâce à un modèle d'IA qui fonctionne entièrement dans votre navigateur — un PNG transparent en quelques secondes, sans téléversement.",
  "name": "Suppresseur d'arrière-plan IA"
 },
 "bmi-calorie-deficit-calculator": {
  "description": "Calculez votre indice de masse corporelle (IMC), votre métabolisme de base (BMR) et votre déficit calorique quotidien exact pour une gestion saine de votre poids.",
  "name": "Calculateur IMC et déficit calorique"
 },
 "color-palette-extractor": {
  "description": "Extrayez les couleurs dominantes de n'importe quelle image dans une palette prête pour les designers — valeurs HEX et RGB, variables CSS et image de la palette.",
  "name": "Extracteur de palette de couleurs"
 },
 "compare-pdf": {
  "description": "Comparez deux documents PDF côte à côte et mettez en évidence les mots ajoutés ou supprimés.",
  "name": "Comparer des PDF"
 },
 "compound-interest-calculator": {
  "description": "Calculez la croissance exponentielle de votre épargne et de votre portefeuille d'investissement avec une capitalisation annuelle, mensuelle ou quotidienne.",
  "name": "Calculateur d'intérêts composés"
 },
 "compress-pdf": {
  "description": "Réduisez la taille de vos fichiers PDF avec une compression recommandée, extrême ou haute qualité — ou un réenregistrement sans perte.",
  "name": "Compresser un PDF"
 },
 "debt-snowball-calculator": {
  "description": "Comparez la méthode Boule de neige de Dave Ramsey et la méthode Avalanche pour éliminer vos dettes de carte de crédit et vos prêts étudiants.",
  "name": "Dette : Boule de neige vs Avalanche"
 },
 "edit-pdf": {
  "description": "Ajoutez du texte, des images et des formes n'importe où sur une page PDF et téléchargez le document modifié.",
  "name": "Modifier un PDF"
 },
 "excel-to-pdf": {
  "description": "Convertissez vos feuilles de calcul Excel et CSV en documents PDF soignés au format paysage.",
  "name": "Excel en PDF"
 },
 "favicon-generator": {
  "description": "Générez un pack favicon complet à partir d'une image, d'un texte ou d'un emoji — fichier ICO, toutes les tailles PNG et les balises HTML, le tout dans un fichier ZIP.",
  "name": "Générateur de favicon"
 },
 "html-to-pdf": {
  "description": "Convertissez l'URL d'une page web ou du code HTML collé en un document PDF.",
  "name": "HTML en PDF"
 },
 "image-background-changer": {
  "description": "Remplacez l'arrière-plan d'une photo par des couleurs studio, des dégradés ou votre propre image de fond — parfait pour les photos de produits.",
  "name": "Changeur d'arrière-plan d'image"
 },
 "image-base64-encoder": {
  "description": "Convertissez n'importe quel fichier image en code Base64 brut (Data URI) à intégrer directement dans vos contenus HTML, CSS et JSON.",
  "name": "Encodeur d'images en Base64"
 },
 "image-collage-maker": {
  "description": "Combinez jusqu'à 9 photos dans un superbe collage — dispositions en grille et en bande, espacements personnalisés, coins arrondis et arrière-plans.",
  "name": "Créateur de collages photo"
 },
 "image-color-picker": {
  "description": "Cliquez sur n'importe quel pixel d'une image pour obtenir sa couleur exacte — valeurs HEX, RGB et HSL, avec une palette des couleurs sélectionnées.",
  "name": "Pipette de couleurs d'image"
 },
 "image-compressor-lossless": {
  "description": "Compressez vos images JPG, PNG et WebP jusqu'à 80 % sans perte de qualité visible, directement dans votre navigateur.",
  "name": "Compresseur d'images sans perte"
 },
 "image-resizer-pro": {
  "description": "Redimensionnez vos images en pixels ou en pourcentage, avec verrouillage des proportions, pour les bannières de réseaux sociaux, les photos d'identité et le web design.",
  "name": "Redimensionneur d'images Pro"
 },
 "image-splitter": {
  "description": "Divisez une image en une grille de tuiles pour vos publications carrousel Instagram et vos bannières — téléchargez toutes les tuiles dans un fichier ZIP.",
  "name": "Diviseur d'images"
 },
 "image-to-ascii-art": {
  "description": "Transformez n'importe quelle photo en art textuel ASCII — largeur et styles de caractères ajustables, exportation en texte ou en image.",
  "name": "Image en art ASCII"
 },
 "image-to-text-ocr": {
  "description": "Extrayez le texte modifiable de vos photos et captures d'écran grâce à l'OCR en anglais, directement dans votre navigateur.",
  "name": "Image en texte (OCR)"
 },
 "image-to-webp-converter": {
  "description": "Convertissez vos images PNG et JPEG au format WebP de Google pour un chargement ultra-rapide de vos pages web et de meilleurs Core Web Vitals SEO.",
  "name": "Convertisseur d'images en WebP"
 },
 "image-watermark": {
  "description": "Apposez des filigranes texte ou logo sur vos photos — à n'importe quelle position ou en mosaïque, avec contrôle de l'opacité et de la taille.",
  "name": "Ajouter un filigrane à une image"
 },
 "invoice-generator-pro": {
  "description": "Créez des factures professionnelles pour vos clients aux États-Unis, au Royaume-Uni et au Canada, avec calcul automatique des taxes, plusieurs devises et exportation PDF.",
  "name": "Générateur de factures Pro"
 },
 "jpg-to-pdf": {
  "description": "Convertissez vos images JPG, PNG et autres en un PDF avec des pages ajustées, A4 ou Letter, et des marges réglables.",
  "name": "JPG en PDF"
 },
 "live-currency-converter": {
  "description": "Convertisseur de taux de change en temps réel pour plus de 160 devises mondiales, dont USD, EUR, GBP, CAD, PKR, INR, AED et SAR.",
  "name": "Convertisseur de devises en temps réel"
 },
 "loan-calculator-usa": {
  "description": "Calculez les mensualités, le total des intérêts et les délais de remboursement pour les prêts personnels, les prêts auto et les financements professionnels.",
  "name": "Calculateur de prêt USA"
 },
 "meme-generator": {
  "description": "Créez des mèmes à partir de n'importe quelle photo avec les légendes classiques en haut et en bas — texte avec contour, taille ajustable, téléchargement PNG instantané.",
  "name": "Générateur de mèmes"
 },
 "merge-pdf": {
  "description": "Combinez plusieurs fichiers PDF en un seul document, dans l'ordre exact de votre choix.",
  "name": "Fusionner des PDF"
 },
 "mortgage-calculator-usa": {
  "description": "Calculez vos mensualités hypothécaires aux États-Unis : capital, intérêts, taxe foncière, assurance PMI et assurance habitation, avec un tableau d'amortissement complet.",
  "name": "Calculateur d'hypothèque USA"
 },
 "multi-calculator-all-in-one": {
  "description": "Suite de calculatrices tout-en-un organisée en onglets : âge et anniversaire, IMC et calories, prêt et mensualités, hypothèque, partage de pourboire et intérêts composés.",
  "name": "Suite de calculatrices tout-en-un"
 },
 "ocr-pdf": {
  "description": "Reconnaissez le texte des PDF numérisés et reconstruisez-les en documents interrogeables avec une couche de texte invisible.",
  "name": "OCR PDF"
 },
 "organize-pdf": {
  "description": "Réorganisez, pivotez et supprimez visuellement les pages d'un PDF, et insérez des pages blanches exactement où vous en avez besoin.",
  "name": "Organiser un PDF"
 },
 "page-numbers-pdf": {
  "description": "Insérez des numéros de page dans un PDF avec le choix de la position, du format, de la taille et du numéro de départ.",
  "name": "Ajouter des numéros de page"
 },
 "passport-photo-maker": {
  "description": "Recadrez et dimensionnez vos photos aux formats officiels de passeport et de visa (États-Unis, Royaume-Uni/UE, Chine, Canada, Australie) à 300 DPI, avec une planche 4×6 imprimable.",
  "name": "Créateur de photos d'identité"
 },
 "pdf-page-counter-inspector": {
  "description": "Inspectez les propriétés de vos documents PDF en toute sécurité : nombre de pages, dimensions, titre, auteur et état de chiffrement.",
  "name": "Compteur de pages PDF et inspecteur de métadonnées"
 },
 "pdf-to-excel": {
  "description": "Transférez le texte des pages PDF dans des feuilles de calcul Excel, une feuille par page, avec les lignes et les colonnes détectées à partir de la mise en page.",
  "name": "PDF en Excel"
 },
 "pdf-to-jpg": {
  "description": "Convertissez les pages PDF en images JPG ou PNG de haute qualité, individuellement ou dans un fichier ZIP.",
  "name": "PDF en JPG"
 },
 "pdf-to-pdfa": {
  "description": "Reconstruisez un PDF avec les métadonnées d'identification PDF/A-3B (XMP) pour un archivage à long terme.",
  "name": "PDF en PDF/A"
 },
 "pdf-to-powerpoint": {
  "description": "Transformez chaque page PDF en diapositive PowerPoint avec l'image de la page et le texte extrait modifiable.",
  "name": "PDF en PowerPoint"
 },
 "pdf-to-word": {
  "description": "Convertissez vos documents PDF en fichiers Word (.docx) modifiables, avec les titres et les paragraphes conservés.",
  "name": "PDF en Word"
 },
 "pdf-to-word-converter": {
  "description": "Extrayez le texte, conservez les paragraphes et convertissez vos documents PDF en fichiers Word (.docx) et texte modifiables, en toute sécurité dans votre navigateur.",
  "name": "Convertisseur PDF vers Word"
 },
 "photo-filter-editor": {
  "description": "Améliorez vos photos avec la luminosité, le contraste, la saturation et plus encore, ainsi que des préréglages en un toucher comme Vif, Mono, Sépia et Vintage.",
  "name": "Éditeur de filtres photo"
 },
 "powerpoint-to-pdf": {
  "description": "Convertissez vos diapositives PowerPoint (.pptx) en un document PDF avec le texte et les images des diapositives.",
  "name": "PowerPoint en PDF"
 },
 "profile-picture-maker": {
  "description": "Créez des photos de profil soignées avec des recadrages circulaires, des anneaux élégants et des arrière-plans personnalisés pour les réseaux sociaux.",
  "name": "Créateur de photos de profil"
 },
 "protect-pdf": {
  "description": "Chiffrez un PDF avec un mot de passe et contrôlez les autorisations d'impression, de copie et de modification.",
  "name": "Protéger un PDF"
 },
 "qr-code-generator": {
  "description": "Créez des codes QR pour les liens, le WiFi, les cartes de contact, les e-mails et les SMS — couleurs et tailles personnalisées, téléchargements PNG et SVG.",
  "name": "Générateur de codes QR"
 },
 "qr-code-scanner": {
  "description": "Scannez et décodez les codes QR à partir d'une image téléversée ou de votre caméra — en toute confidentialité, dans votre navigateur.",
  "name": "Scanner de codes QR"
 },
 "redact-pdf": {
  "description": "Masquez définitivement les textes et zones sensibles — en dessinant des cadres ou en recherchant des mots.",
  "name": "Caviarder un PDF"
 },
 "repair-pdf": {
  "description": "Récupérez les pages de fichiers PDF endommagés ou corrompus en reconstruisant la structure du document.",
  "name": "Réparer un PDF"
 },
 "resume-builder-usa-format": {
  "description": "Créez des CV professionnels propres, conformes aux normes américaines et compatibles ATS. Éditeur en temps réel, mise en page soignée et impression PDF en un clic.",
  "name": "Créateur de CV format USA"
 },
 "retirement-401k-calculator": {
  "description": "Prévoyez votre capital retraite, les contributions de votre employeur et vos retraits annuels en fonction de l'inflation et des taux de rendement.",
  "name": "Calculateur de retraite 401(k)"
 },
 "rotate-pdf": {
  "description": "Faites pivoter toutes les pages ou une plage de pages choisie d'un PDF de 90, 180 ou 270 degrés — de façon permanente.",
  "name": "Pivoter un PDF"
 },
 "scan-to-pdf": {
  "description": "Capturez les pages de vos documents avec votre caméra ou téléversez des photos et combinez-les en un seul PDF.",
  "name": "Numériser en PDF"
 },
 "sign-pdf": {
  "description": "Dessinez, tapez ou téléversez votre signature et placez-la sur n'importe quelle page d'un document PDF.",
  "name": "Signer un PDF"
 },
 "split-pdf": {
  "description": "Séparez les pages d'un PDF par plages personnalisées, extrayez les pages sélectionnées ou divisez-le en fichiers d'une seule page.",
  "name": "Diviser un PDF"
 },
 "student-loan-payoff-calculator": {
  "description": "Calculez l'amortissement de vos prêts étudiants fédéraux et privés, les estimations de remboursement du plan SAVE et les stratégies de réduction des intérêts.",
  "name": "Calculateur de remboursement de prêt étudiant"
 },
 "svg-to-png-converter": {
  "description": "Convertissez vos graphiques SVG en images PNG nettes à n'importe quelle taille, avec des arrière-plans transparents ou colorés.",
  "name": "Convertisseur SVG en PNG"
 },
 "tax-calculator-2026-usa": {
  "description": "Calculez l'impôt fédéral américain sur le revenu 2026, les cotisations FICA (Sécurité sociale et Medicare), l'impôt d'État et le salaire net par État.",
  "name": "Calculateur d'impôts 2026 USA"
 },
 "unlock-pdf": {
  "description": "Supprimez les restrictions par mot de passe d'un PDF — instantanément pour les fichiers verrouillés par autorisations, ou avec le mot de passe du document.",
  "name": "Déverrouiller un PDF"
 },
 "watermark-pdf": {
  "description": "Apposez des filigranes texte ou image sur les pages PDF avec une taille, une opacité et un placement personnalisés.",
  "name": "Ajouter un filigrane à un PDF"
 },
 "word-to-pdf": {
  "description": "Convertissez vos documents Word (.docx) en fichiers PDF propres et imprimables, directement dans votre navigateur.",
  "name": "Word en PDF"
 },
 "word-to-pdf-converter-safe": {
  "description": "Formatez, stylisez et générez des documents PDF standard à partir de texte, de notes et de documents riches, 100 % dans votre navigateur.",
  "name": "Convertisseur texte et Word en PDF"
 },
 "ai-pdf-summarizer": {
  "description": "Extrayez le texte d’un PDF et générez un résumé bref, détaillé ou en puces grâce à l’IA (Gemini).",
  "name": "Résumé de PDF par IA"
 },
 "alternate-mix-pdf": {
  "description": "Entrelacez les pages de deux PDF ou plus — idéal pour fusionner des scans recto simple de documents recto verso.",
  "name": "Alterner et mélanger des PDF"
 },
 "bates-numbering-pdf": {
  "description": "Apposez des numéros Bates séquentiels (par ex. CASE-000001) sur un ou plusieurs fichiers PDF pour la communication de pièces juridiques.",
  "name": "Numérotation Bates"
 },
 "create-bookmarks-pdf": {
  "description": "Ajoutez un plan de signets à un PDF — manuellement, ou automatiquement à partir de la première ligne de chaque page.",
  "name": "Créer des signets PDF"
 },
 "crop-pdf": {
  "description": "Réduisez les marges des pages d'un PDF — pour toutes les pages ou une plage choisie — en pourcentages ou en millimètres.",
  "name": "Rogner un PDF"
 },
 "delete-pdf-pages": {
  "description": "Cliquez sur les pages à retirer d'un PDF et téléchargez le document nettoyé.",
  "name": "Supprimer des pages d'un PDF"
 },
 "deskew-pdf": {
  "description": "Détectez l'angle d'inclinaison des pages numérisées et redressez-les automatiquement.",
  "name": "Redresser un PDF"
 },
 "edit-pdf-metadata": {
  "description": "Affichez et modifiez le titre, l’auteur, le sujet, les mots-clés, le créateur et le producteur d’un PDF — ou effacez-les tous.",
  "name": "Modifier les métadonnées PDF"
 },
 "epub-to-pdf": {
  "description": "Convertissez un livre électronique EPUB en document PDF paginé, chapitre par chapitre.",
  "name": "EPUB en PDF"
 },
 "extract-pdf-images": {
  "description": "Extrayez les images originales intégrées à un PDF au format PNG — sans captures d'écran, sans perte de qualité.",
  "name": "Extraire les images d'un PDF"
 },
 "extract-pdf-pages": {
  "description": "Extrayez les plages de pages sélectionnées d'un PDF dans un nouveau document, ou un fichier par plage.",
  "name": "Extraire des pages d'un PDF"
 },
 "extract-word-images": {
  "description": "Extrayez chaque image intégrée à un document Word dans sa qualité d'origine, dans un seul zip.",
  "name": "Extraire les images d'un Word"
 },
 "flatten-pdf": {
  "description": "Aplatissez les champs de formulaire dans le contenu de la page pour que les formulaires remplis ne puissent plus être modifiés — ou aplatissez tout.",
  "name": "Aplatir un PDF"
 },
 "flip-pdf-pages": {
  "description": "Retournez les pages d'un PDF horizontalement ou verticalement — corrige les scans en miroir et les captures inversées.",
  "name": "Retourner les pages d'un PDF"
 },
 "gif-to-pdf": {
  "description": "Convertissez des images GIF en un document PDF (première image des GIF animés).",
  "name": "GIF en PDF"
 },
 "grayscale-pdf": {
  "description": "Convertissez un PDF couleur en noir et blanc en niveaux de gris — économise l'encre et réduit souvent la taille du fichier.",
  "name": "PDF en niveaux de gris"
 },
 "grocery-budget-planner": {
  "description": "Planifiez vos dépenses hebdomadaires de courses, calculez le coût par repas et évitez les dépassements dans les supermarchés américains.",
  "name": "Planificateur de budget courses et coût des repas"
 },
 "header-footer-pdf": {
  "description": "Apposez un texte d'en-tête et de pied de page personnalisé — à gauche, au centre, à droite — avec des marqueurs de numéro de page sur chaque page.",
  "name": "Ajouter un en-tête et un pied de page à un PDF"
 },
 "heic-to-pdf": {
  "description": "Convertissez des photos HEIC d'iPhone en PDF — fonctionne là où votre navigateur peut afficher le HEIC (par ex. Safari).",
  "name": "HEIC en PDF"
 },
 "home-electricity-cost-calculator": {
  "description": "Calculez le coût réel de fonctionnement en électricité des climatiseurs, radiateurs, réfrigérateurs et ordinateurs en kWh.",
  "name": "Calculateur de coût d'électricité domestique"
 },
 "length-distance-converter": {
  "description": "Convertissez entre pouces, pieds, yards, miles, millimètres, centimètres, mètres et kilomètres avec une précision exacte.",
  "name": "Convertisseur de longueur et distance"
 },
 "lorem-ipsum-generator-pro": {
  "description": "Générez un texte factice personnalisable par paragraphes, phrases, mots ou listes, pour les designers et les développeurs.",
  "name": "Générateur de Lorem Ipsum Pro"
 },
 "merge-word": {
  "description": "Combinez plusieurs documents Word en un seul .docx, l'un après l'autre avec des sauts de page.",
  "name": "Fusionner des documents Word"
 },
 "nup-pdf": {
  "description": "Imprimez plusieurs pages PDF par feuille — 2, 4, 6 ou 9 par feuille au format A4, A3 ou Letter — en gardant des pages vectorielles nettes.",
  "name": "PDF en pages multiples par feuille"
 },
 "odt-to-word": {
  "description": "Convertissez des fichiers OpenDocument Text (.odt) en documents Word (.docx) modifiables.",
  "name": "ODT en Word"
 },
 "pdf-background": {
  "description": "Appliquez une couleur d'arrière-plan derrière chaque page d'un PDF — papiers à en-tête, formulaires et documents à distribuer.",
  "name": "Ajouter un fond à un PDF"
 },
 "pdf-forms": {
  "description": "Détectez et remplissez les champs de formulaire d'un PDF, ou ajoutez de nouveaux champs de texte et cases à cocher à remplir.",
  "name": "Formulaires PDF"
 },
 "pdf-reader": {
  "description": "Lisez vos PDF directement dans votre navigateur avec zoom — aucun envoi de fichier, aucune installation, en toute confidentialité.",
  "name": "Lecteur PDF"
 },
 "pdf-to-bmp": {
  "description": "Convertissez les pages d'un PDF en images BMP jusqu'à 3x la résolution d'origine.",
  "name": "PDF en BMP"
 },
 "pdf-to-csv": {
  "description": "Extrayez les lignes d'un PDF dans un fichier CSV — les colonnes sont détectées à partir de la mise en page.",
  "name": "PDF en CSV"
 },
 "pdf-to-epub": {
  "description": "Convertissez un PDF en livre électronique EPUB au texte réajustable, avec des chapitres lisibles sur n'importe quelle liseuse.",
  "name": "PDF en EPUB"
 },
 "pdf-to-markdown": {
  "description": "Transformez un PDF en Markdown propre — titres déduits de la taille des polices, listes normalisées et séparateurs de pages.",
  "name": "PDF en Markdown"
 },
 "pdf-to-png": {
  "description": "Convertissez les pages d'un PDF en images PNG à fond transparent, jusqu'à 3x la résolution d'origine.",
  "name": "PDF en PNG"
 },
 "pdf-to-text": {
  "description": "Extrayez tout le texte d'un PDF dans un fichier .txt brut, avec un aperçu en direct et des compteurs.",
  "name": "PDF en texte"
 },
 "pdf-to-tiff": {
  "description": "Convertissez les pages d'un PDF en un fichier TIFF multipage à 150 ou 300 DPI pour l'impression et le fax.",
  "name": "PDF en TIFF"
 },
 "png-to-pdf": {
  "description": "Convertissez des images PNG en PDF avec des pages ajustées, A4 ou Letter et des marges réglables.",
  "name": "PNG en PDF"
 },
 "remove-annotations-pdf": {
  "description": "Retirez toutes les annotations — surlignages, commentaires, tampons et marques — d'un PDF en une seule fois.",
  "name": "Supprimer les annotations d'un PDF"
 },
 "remove-watermark-pdf": {
  "description": "Recouvrez les zones de filigrane avec des patchs opaques que vous dessinez — le reste de chaque page reste vectoriel et net.",
  "name": "Suppresseur de filigrane PDF"
 },
 "rename-pdf-by-content": {
  "description": "Renommez automatiquement les fichiers PDF à partir de la première ligne de texte de chaque document.",
  "name": "Renommer un PDF selon son contenu"
 },
 "resize-pdf-pages": {
  "description": "Modifiez la taille des pages d'un PDF — A3, A4, A5, Letter ou Legal — en adaptant le contenu à la page ou en l'étirant.",
  "name": "Redimensionner les pages d'un PDF"
 },
 "split-pdf-by-bookmarks": {
  "description": "Divisez un PDF en documents distincts à chaque signet — un fichier par chapitre ou section.",
  "name": "Diviser un PDF par signets"
 },
 "split-pdf-by-size": {
  "description": "Divisez un gros PDF en documents plus petits qui restent chacun sous une taille de fichier cible en MB.",
  "name": "Diviser un PDF par taille"
 },
 "split-pdf-by-text": {
  "description": "Divisez un PDF à chaque occurrence d'un mot ou d'une expression — séparez automatiquement factures, relevés ou rapports.",
  "name": "Diviser un PDF par texte"
 },
 "split-pdf-in-half": {
  "description": "Divisez les scans en double page en pages simples — des planches A3 en double A4, ou A4 en double A5.",
  "name": "Diviser un PDF en deux"
 },
 "split-word": {
  "description": "Divisez un document Word en fichiers distincts — à chaque titre de chapitre ou tous les N paragraphes.",
  "name": "Diviser un document Word"
 },
 "temperature-converter-pro": {
  "description": "Convertissez entre Fahrenheit (°F), Celsius (°C) et Kelvin (K) avec les formules mathématiques étape par étape.",
  "name": "Convertisseur de température Pro"
 },
 "text-case-converter": {
  "description": "Convertissez instantanément un texte en MAJUSCULES, minuscules, Casse Titre, casse de phrase, camelCase, kebab-case et snake_case.",
  "name": "Convertisseur de casse Pro"
 },
 "text-to-pdf": {
  "description": "Transformez un texte saisi ou collé — ou un fichier .txt — en un document PDF propre et paginé.",
  "name": "Texte en PDF"
 },
 "text-to-word": {
  "description": "Transformez du texte brut ou du Markdown en un document Word formaté — collez du texte ou importez un fichier .txt/.md.",
  "name": "Texte en Word"
 },
 "tiff-to-pdf": {
  "description": "Convertissez des images TIFF — y compris les TIFF multipages — en un document PDF.",
  "name": "TIFF en PDF"
 },
 "tip-bill-splitter-calculator": {
  "description": "Calculez les pourcentages de pourboire américains standard (15 %, 18 %, 20 %, 25 %) et partagez l'addition du restaurant équitablement entre amis.",
  "name": "Calculateur de pourboire et partage d'addition"
 },
 "translate-pdf": {
  "description": "Traduisez un document PDF entier en anglais grâce à l'IA, en conservant l'ordre des pages et la structure.",
  "name": "Traduire un PDF"
 },
 "webp-to-pdf": {
  "description": "Convertissez des images WebP en un document PDF en quelques secondes.",
  "name": "WebP en PDF"
 },
 "weight-mass-converter": {
  "description": "Convertissez facilement entre livres (lbs), onces (oz), kilogrammes (kg), grammes (g), stones et tonnes métriques.",
  "name": "Convertisseur de poids et masse"
 },
 "word-character-counter-pro": {
  "description": "Comptage instantané en temps réel des mots et des caractères (avec ou sans espaces), temps de lecture, temps de parole et vérification de la densité des mots-clés.",
  "name": "Compteur de mots et caractères Pro"
 },
 "word-editor": {
  "description": "Modifiez un document Word en ligne — changez le texte, les titres et la mise en forme, puis téléchargez le .docx mis à jour.",
  "name": "Éditeur Word"
 },
 "word-to-epub": {
  "description": "Transformez un document Word en livre électronique EPUB, avec un chapitre créé à chaque titre de premier niveau.",
  "name": "Word en EPUB"
 },
 "word-to-html": {
  "description": "Convertissez un document Word en un fichier HTML propre et autonome, avec un aperçu en direct.",
  "name": "Word en HTML"
 },
 "word-to-jpg": {
  "description": "Convertissez un document Word en images JPG ou PNG — une image par page, zippées pour le téléchargement.",
  "name": "Word en JPG"
 },
 "word-to-markdown": {
  "description": "Convertissez un document Word en Markdown propre, avec les titres, les listes et les mises en emphase conservés.",
  "name": "Word en Markdown"
 },
 "word-to-odt": {
  "description": "Convertissez des documents Word (.docx) en OpenDocument Text (.odt) pour LibreOffice et OpenOffice.",
  "name": "Word en ODT"
 },
 "word-to-text": {
  "description": "Extrayez le texte brut d'un document Word et téléchargez-le au format .txt.",
  "name": "Word en texte"
 },
 "word-viewer": {
  "description": "Ouvrez et lisez n'importe quel document Word (.docx) directement dans votre navigateur — sans Microsoft Word.",
  "name": "Visionneuse Word"
 },
 "base64-encoder-decoder": {
  "description": "Encodez et décodez du Base64 avec une prise en charge complète d'Unicode et l'option d'alphabet compatible URL.",
  "name": "Encodeur et décodeur Base64"
 },
 "chmod-calculator": {
  "description": "Convertissez les permissions de fichiers Linux entre cases à cocher rwx, nombres octaux et notation symbolique.",
  "name": "Calculateur Chmod"
 },
 "code-minifier": {
  "description": "Minifiez HTML, CSS et JavaScript pour réduire le poids des pages et améliorer la vitesse de chargement, avec des statistiques de taille avant et après.",
  "name": "Minifieur HTML CSS JS"
 },
 "code-to-text-ratio-checker": {
  "description": "Mesurez le ratio entre le texte visible et le code HTML d'une page et extrayez son texte lisible.",
  "name": "Vérificateur de ratio code/texte"
 },
 "color-converter": {
  "description": "Convertissez les couleurs entre HEX, RGB, HSL, HSV et CMYK, avec nuances, teintes et ratios de contraste WCAG.",
  "name": "Convertisseur de couleurs"
 },
 "compare-word": {
  "description": "Comparez deux versions d'un document Word et mettez en évidence les mots ajoutés ou supprimés.",
  "name": "Comparer des documents Word"
 },
 "compress-word": {
  "description": "Réduisez la taille d'un document Word en recompressant et en redimensionnant ses images intégrées.",
  "name": "Compresser Word"
 },
 "cron-expression-parser": {
  "description": "Expliquez les expressions cron en langage clair et prévisualisez les prochains horaires d'exécution.",
  "name": "Analyseur d'expressions Cron"
 },
 "css-gradient-generator": {
  "description": "Concevez visuellement des dégradés CSS linéaires et radiaux avec plusieurs points de couleur et un code prêt à copier.",
  "name": "Générateur de dégradés CSS"
 },
 "csv-to-json-converter": {
  "description": "Convertissez des données CSV en JSON avec une inférence automatique des types pour les nombres, les booléens et les valeurs nulles.",
  "name": "Convertisseur CSV vers JSON"
 },
 "duplicate-content-checker": {
  "description": "Comparez deux textes pour détecter les doublons : pourcentage de similarité, expressions communes et phrases identiques mises en évidence.",
  "name": "Vérificateur de contenu dupliqué"
 },
 "faq-schema-generator": {
  "description": "Transformez des paires de questions-réponses en balisage schema FAQPage JSON-LD valide pour des résultats de recherche enrichis.",
  "name": "Générateur de schema FAQ"
 },
 "hash-generator": {
  "description": "Générez des hachages MD5, SHA-1, SHA-256, SHA-384 et SHA-512 de n'importe quel texte, plus des signatures HMAC à clé.",
  "name": "Générateur de hachage"
 },
 "heading-structure-checker": {
  "description": "Extrayez le plan des titres H1 à H6 du HTML d’une page et signalez les H1 multiples, les niveaux sautés et les titres vides.",
  "name": "Vérificateur de structure des titres"
 },
 "headline-analyzer": {
  "description": "Évaluez vos titres pour générer des clics : mots puissants, attrait émotionnel, chiffres, longueur, format et risque de clickbait.",
  "name": "Analyseur de titres"
 },
 "hreflang-generator": {
  "description": "Générez des balises hreflang pour les sites multilingues, sous forme de balises link HTML ou de sitemap XML hreflang complet.",
  "name": "Générateur de balises hreflang"
 },
 "htaccess-redirect-generator": {
  "description": "Générez des règles de redirection 301/302 pour Apache (.htaccess) ou Nginx en masse, plus des règles canoniques HTTPS et www.",
  "name": "Générateur de redirections Htaccess"
 },
 "html-entity-encoder-decoder": {
  "description": "Convertissez les caractères spéciaux en entités HTML et inversement : références nommées, numériques et hexadécimales.",
  "name": "Encodeur et décodeur d'entités HTML"
 },
 "http-status-code-reference": {
  "description": "Référence consultable des codes de statut HTTP : ce que signifie chaque code de 1xx à 5xx et quand il est utilisé.",
  "name": "Référence des codes de statut HTTP"
 },
 "json-diff-checker": {
  "description": "Comparez deux documents JSON et voyez exactement quelles clés ont été ajoutées, supprimées ou modifiées, par chemin.",
  "name": "Vérificateur de différences JSON"
 },
 "json-formatter": {
  "description": "Formatez, validez et minifiez du JSON avec la localisation précise des erreurs, ligne et colonne, plus le tri des clés.",
  "name": "Formateur et validateur JSON"
 },
 "json-to-csv-converter": {
  "description": "Convertissez instantanément des tableaux et objets JSON en feuilles de calcul CSV propres.",
  "name": "Convertisseur JSON vers CSV"
 },
 "json-to-typescript": {
  "description": "Générez automatiquement des interfaces TypeScript à partir d'un exemple JSON, avec la gestion des objets imbriqués et des tableaux.",
  "name": "JSON vers TypeScript"
 },
 "json-to-yaml-converter": {
  "description": "Convertissez du JSON en YAML propre et lisible pour les configurations, Kubernetes et les pipelines CI.",
  "name": "Convertisseur JSON vers YAML"
 },
 "jwt-decoder": {
  "description": "Décodez l'en-tête et la charge utile d'un JWT, inspectez les claims avec des dates lisibles et vérifiez les signatures HS256.",
  "name": "Décodeur JWT"
 },
 "keyword-clustering": {
  "description": "Regroupez automatiquement une liste de mots-clés en clusters thématiques, pour que chaque cluster devienne une page ou un article ciblé.",
  "name": "Outil de regroupement de mots-clés"
 },
 "keyword-combiner": {
  "description": "Combinez deux ou trois listes de mots-clés dans toutes les permutations, avec l'encadrement des types de correspondance Google Ads.",
  "name": "Combinateur de mots-clés"
 },
 "keyword-density-checker": {
  "description": "Analysez la fréquence et la densité des expressions de 1, 2 et 3 mots dans votre contenu pour éviter la sur-optimisation.",
  "name": "Vérificateur de densité de mots-clés"
 },
 "link-extractor": {
  "description": "Extrayez tous les liens du HTML d’une page — texte d’ancre, internes/externes, dofollow/nofollow — avec export CSV.",
  "name": "Extracteur de liens"
 },
 "llms-txt-generator": {
  "description": "Créez un fichier llms.txt qui indique aux assistants IA (ChatGPT, Claude, Gemini) comment lire et citer votre site web.",
  "name": "Générateur de LLMs.txt"
 },
 "meta-tag-analyzer": {
  "description": "Collez le HTML d’une page pour auditer son titre, sa description, son canonical, ses directives robots, Open Graph, ses titres, ses images et ses liens.",
  "name": "Analyseur de balises méta"
 },
 "meta-tag-generator": {
  "description": "Générez des balises méta complètes : title, description, robots, canonical, Open Graph et cartes Twitter, avec vérification des longueurs en temps réel.",
  "name": "Générateur de balises méta"
 },
 "number-base-converter": {
  "description": "Convertissez des nombres entre binaire, octal, décimal, hexadécimal et toute base de 2 à 36, en précision arbitraire.",
  "name": "Convertisseur de bases numériques"
 },
 "on-page-seo-analyzer": {
  "description": "Audit SEO on-page complet avec un score sur 100 : placement des mots-clés, densité, titres, liens, lisibilité et vérifications des balises méta.",
  "name": "Analyseur SEO on-page"
 },
 "open-graph-generator": {
  "description": "Créez des balises Open Graph et Twitter Card et prévisualisez exactement l'apparence de votre lien lorsqu'il est partagé sur les réseaux sociaux.",
  "name": "Générateur Open Graph"
 },
 "password-generator": {
  "description": "Générez des mots de passe aléatoires forts directement sur votre appareil, avec un hasard de qualité cryptographique et un indicateur d'entropie.",
  "name": "Générateur de mots de passe"
 },
 "protect-word": {
  "description": "Restreignez la modification d'un document Word : lecture seule, commentaires uniquement, suivi des modifications ou remplissage de formulaire.",
  "name": "Protéger Word"
 },
 "readability-checker": {
  "description": "Évaluez votre contenu avec Flesch Reading Ease, Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau et ARI, plus le repérage des phrases trop longues.",
  "name": "Vérificateur de lisibilité"
 },
 "redirect-chain-analyzer": {
  "description": "Auditez une carte de redirections pour détecter les chaînes, les boucles et les règles en double, et obtenez en retour une carte aplatie en un seul saut.",
  "name": "Analyseur de chaînes de redirection"
 },
 "regex-tester": {
  "description": "Testez des expressions régulières en direct avec mise en évidence des correspondances, groupes de capture et groupes nommés.",
  "name": "Testeur de Regex"
 },
 "repair-word": {
  "description": "Réparez un document Word endommagé : reconstruction de la structure du fichier, ou récupération de son texte dans un fichier .docx propre.",
  "name": "Réparer Word"
 },
 "robots-txt-generator": {
  "description": "Créez un fichier robots.txt valide avec des règles d'autorisation et d'interdiction par robot, le crawl-delay et des entrées de sitemap, plus des préréglages en un clic.",
  "name": "Générateur de robots.txt"
 },
 "robots-txt-tester": {
  "description": "Testez si des URL sont autorisées ou bloquées par un fichier robots.txt pour n'importe quel user-agent, selon les vraies règles de correspondance.",
  "name": "Testeur de robots.txt"
 },
 "schema-generator": {
  "description": "Créez des données structurées JSON-LD valides : Article, Product, LocalBusiness, HowTo, Breadcrumb, Organization et WebSite.",
  "name": "Générateur de balisage Schema"
 },
 "seo-roi-calculator": {
  "description": "Calculez le retour sur investissement d'une campagne SEO : trafic projeté, conversions, revenus, seuil de rentabilité et montée en charge sur 12 mois.",
  "name": "Calculateur de ROI SEO"
 },
 "serp-snippet-preview": {
  "description": "Prévisualisez l'apparence de votre page dans les résultats de recherche Google, sur ordinateur et sur mobile, avec une vérification réelle de la troncature en pixels.",
  "name": "Aperçu d'extrait SERP"
 },
 "sitemap-validator": {
  "description": "Validez un sitemap XML et détectez les erreurs : URL invalides, dates lastmod incorrectes, priorités erronées et doublons.",
  "name": "Validateur de sitemap"
 },
 "sql-formatter": {
  "description": "Formatez des requêtes SQL avec des sauts de ligne par clause et une casse cohérente des mots-clés pour des requêtes lisibles.",
  "name": "Formateur SQL"
 },
 "text-diff-checker": {
  "description": "Comparez deux textes ligne par ligne et mettez en évidence les ajouts et les suppressions.",
  "name": "Vérificateur de différences de texte"
 },
 "timestamp-converter": {
  "description": "Convertissez des timestamps Unix en dates lisibles et inversement : secondes et millisecondes, UTC, heure locale et temps relatif.",
  "name": "Convertisseur de timestamp Unix"
 },
 "unlock-word": {
  "description": "Supprimez les restrictions de modification (lecture seule / protection de formulaire) d'un document Word pour pouvoir le modifier à nouveau.",
  "name": "Déverrouiller Word"
 },
 "url-encoder-decoder": {
  "description": "Encodez en pour-cent ou décodez des URL et des composants de requête en toute sécurité et instantanément.",
  "name": "Encodeur et décodeur d'URL"
 },
 "url-parser": {
  "description": "Décomposez une URL en protocole, hôte, segments de chemin et paramètres de requête, et modifiez les paramètres pour la reconstruire.",
  "name": "Analyseur d'URL"
 },
 "user-agent-parser": {
  "description": "Analysez n'importe quelle chaîne user-agent : navigateur, version, système d'exploitation, type d'appareil et moteur de rendu.",
  "name": "Analyseur de User Agent"
 },
 "utm-builder": {
  "description": "Créez des URL de campagne avec des paramètres UTM pour Google Analytics : source, medium, campaign, term et content.",
  "name": "Générateur d'UTM"
 },
 "uuid-generator": {
  "description": "Générez des identifiants UUID v4 (aléatoires) et v7 (ordonnés par le temps) en masse, jusqu'à 500 à la fois.",
  "name": "Générateur d'UUID"
 },
 "word-analyzer": {
  "description": "Statistiques complètes d'un document Word : mots, caractères, titres, tableaux, images, temps de lecture et mots les plus fréquents.",
  "name": "Analyseur de document Word"
 },
 "word-find-replace": {
  "description": "Recherchez et remplacez du texte dans tout un document Word, en-têtes et pieds de page inclus, en une seule passe.",
  "name": "Rechercher et remplacer dans Word"
 },
 "word-metadata-editor": {
  "description": "Affichez, modifiez ou supprimez les propriétés d’un document Word — titre, auteur, sujet, mots-clés et plus encore.",
  "name": "Éditeur de métadonnées Word"
 },
 "word-watermark": {
  "description": "Appliquez un filigrane texte en diagonale (CONFIDENTIEL, BROUILLON…) sur chaque page d'un document Word.",
  "name": "Filigrane Word"
 },
 "xml-formatter": {
  "description": "Mettez en forme et validez du XML avec vérification de l'équilibre des balises, ou minifiez-le à nouveau.",
  "name": "Formateur XML"
 },
 "xml-sitemap-generator": {
  "description": "Transformez une liste d'URL en un sitemap XML valide avec lastmod, changefreq et priority, prêt à être mis en ligne et soumis.",
  "name": "Générateur de sitemap XML"
 },
 "yaml-to-json-converter": {
  "description": "Convertissez des configurations YAML en JSON : mappings, séquences, collections en flux et scalaires de bloc pris en charge.",
  "name": "Convertisseur YAML vers JSON"
 },
 "age-calculator": {
  "description": "Découvrez votre âge exact en années, mois et jours — ainsi que le nombre total de jours vécus, le jour de la semaine de votre naissance, votre signe du zodiaque et le compte à rebours jusqu’à votre prochain anniversaire.",
  "name": "Calculateur d’âge"
 },
 "ai-bio-generator": {
  "description": "Obtenez cinq biographies de profil prêtes à l’emploi pour Instagram, X, LinkedIn, TikTok ou Facebook, dans votre style.",
  "name": "Générateur de bio IA"
 },
 "ai-business-name-generator": {
  "description": "Obtenez 15 idées de noms d’entreprise faciles à retenir, avec des slogans, pour n’importe quel secteur et n’importe quel style.",
  "name": "Générateur de noms d’entreprise IA"
 },
 "ai-caption-generator": {
  "description": "Générez des légendes accrocheuses avec hashtags pour les réseaux sociaux : Instagram, Facebook, X, LinkedIn et TikTok.",
  "name": "Générateur de légendes IA"
 },
 "ai-chat": {
  "description": "Discutez avec Google Gemini — posez des questions, trouvez des idées, obtenez de l’aide pour coder ou préparez vos entretiens grâce à des assistants prédéfinis.",
  "name": "Chat IA"
 },
 "ai-cover-letter-generator": {
  "description": "Générez une lettre de motivation sur mesure à partir de votre poste, de l’entreprise, de votre expérience et de vos compétences — sans crochets à remplir.",
  "name": "Générateur de lettres de motivation IA"
 },
 "ai-email-writer": {
  "description": "Rédigez des e-mails professionnels en quelques secondes — choisissez l’objectif et le ton, ajoutez vos points clés et obtenez un e-mail prêt à envoyer.",
  "name": "Rédacteur d’e-mails IA"
 },
 "ai-grammar-checker": {
  "description": "Corrigez la grammaire, l’orthographe et la ponctuation — et consultez une liste claire de chaque modification apportée.",
  "name": "Correcteur grammatical IA"
 },
 "ai-hashtag-generator": {
  "description": "Décrivez votre publication et obtenez 30 hashtags générés par IA, regroupés par portée, pour Instagram, TikTok ou X — adaptés à votre niche et prêts à coller.",
  "name": "Générateur de hashtags IA"
 },
 "ai-hook-generator": {
  "description": "Générez 10 accroches d’ouverture percutantes pour vos TikTok, Reels ou Shorts — choisissez le ton et saisissez votre sujet.",
  "name": "Générateur d’accroches IA"
 },
 "ai-image-generator": {
  "description": "Créez des images à partir de descriptions textuelles avec Google Gemini — photoréaliste, illustration, anime, 3D, aquarelle et bien d’autres styles.",
  "name": "Générateur d’images IA"
 },
 "ai-paraphraser": {
  "description": "Réécrivez n’importe quel texte selon sept modes — standard, fluide, formel, simple, créatif, plus court ou plus long — tout en conservant le sens.",
  "name": "Outil de paraphrase IA"
 },
 "ai-poem-generator": {
  "description": "Écrivez des poèmes dans des formes authentiques — haïku, sonnet, limerick, ballade, acrostiche ou vers libres — sur n’importe quel sujet et n’importe quelle ambiance.",
  "name": "Générateur de poèmes IA"
 },
 "ai-quiz-generator": {
  "description": "Collez vos notes de cours et obtenez instantanément un quiz à choix multiples avec son corrigé — puis passez le test et découvrez votre score.",
  "name": "Générateur de quiz IA"
 },
 "ai-story-generator": {
  "description": "Créez des histoires originales dans huit genres — nommez votre héros, plantez le décor et ajoutez un rebondissement facultatif.",
  "name": "Générateur d’histoires IA"
 },
 "ai-text-summarizer": {
  "description": "Résumez de longs articles et documents sous forme de court paragraphe, de puces ou de points essentiels.",
  "name": "Résumeur de texte IA"
 },
 "ai-translator": {
  "description": "Traduisez un texte de n’importe quelle langue vers un anglais naturel et fluide grâce à la traduction par IA.",
  "name": "Traducteur IA"
 },
 "ai-writer": {
  "description": "Générez des articles de blog, des descriptions de produits, des essais et des publications sociales sur n’importe quel sujet — choisissez le ton et la longueur.",
  "name": "Rédacteur IA"
 },
 "audio-converter": {
  "description": "Convertissez vos fichiers audio entre MP3, WAV, M4A et OGG avec contrôle du débit binaire.",
  "name": "Convertisseur audio"
 },
 "audio-joiner": {
  "description": "Fusionnez plusieurs fichiers audio en une seule piste — les formats mixtes sont acceptés, avec une sortie en MP3, WAV, M4A ou OGG.",
  "name": "Fusion audio"
 },
 "audio-speed-changer": {
  "description": "Accélérez ou ralentissez un audio de 0,25× à 3× sans modifier la hauteur du son.",
  "name": "Changeur de vitesse audio"
 },
 "audio-trimmer": {
  "description": "Découpez vos fichiers audio à l’aide d’une forme d’onde visuelle, de points de début et de fin précis et d’effets de fondu entrant et sortant.",
  "name": "Découpeur audio"
 },
 "audio-volume-booster": {
  "description": "Rendez un audio trop faible plus fort grâce à un contrôle de gain jusqu’à +30 dB, ou normalisez correctement la voix avec loudnorm.",
  "name": "Amplificateur de volume audio"
 },
 "citation-generator": {
  "description": "Générez des références parfaites aux formats APA 7, MLA 9, Chicago et Harvard pour les livres, articles de revues et sites web.",
  "name": "Générateur de citations"
 },
 "date-calculator": {
  "description": "Comptez les jours entre deux dates (jours ouvrés inclus) ou ajoutez et soustrayez des jours à n’importe quelle date.",
  "name": "Calculateur de dates"
 },
 "emoji-picker": {
  "description": "Parcourez des emojis sélectionnés par catégorie, composez votre légende dans la zone prévue et copiez-la d’un seul toucher.",
  "name": "Sélecteur d’emoji et presse-papiers"
 },
 "engagement-rate-calculator": {
  "description": "Calculez votre taux d’engagement sur Instagram, TikTok ou YouTube à partir des abonnés, mentions J’aime, commentaires, partages et enregistrements — avec un verdict en langage simple.",
  "name": "Calculateur de taux d’engagement"
 },
 "equation-solver": {
  "description": "Résolvez des équations du second degré et linéaires avec toutes les étapes détaillées — discriminant, substitution dans la formule et racines expliquées.",
  "name": "Résolveur d’équations avec étapes"
 },
 "essay-word-counter": {
  "description": "Comptez les mots, caractères et phrases ainsi que le temps de lecture — suivez votre progression vers l’objectif de votre essai et vérifiez sa lisibilité.",
  "name": "Compteur de mots pour essais"
 },
 "fancy-text-generator": {
  "description": "Transformez un texte ordinaire en styles Unicode gras, script, fraktur, entourés, en petites capitales ou à l’envers pour vos bios et publications — touchez pour copier.",
  "name": "Générateur de texte stylé"
 },
 "flashcard-maker": {
  "description": "Créez vos propres cartes mémoire, révisez-les en mode retournement avec mélange aléatoire et exportez votre jeu — une alternative gratuite à Quizlet.",
  "name": "Créateur de cartes mémoire"
 },
 "giveaway-picker": {
  "description": "Collez les commentaires de votre concours et tirez un gagnant au hasard en toute équité — doublons supprimés, anciens gagnants exclus.",
  "name": "Sélecteur de gagnant de concours"
 },
 "gpa-calculator": {
  "description": "Calculez votre GPA semestriel et votre CGPA sur des échelles de 4,0 standard ou avec plus/moins — et déterminez le GPA nécessaire pour atteindre votre objectif.",
  "name": "Calculateur de moyenne (GPA)"
 },
 "hashtag-counter": {
  "description": "Comptez les hashtags d’une légende, repérez les doublons, supprimez-les et vérifiez la limite de 30 hashtags sur Instagram.",
  "name": "Compteur et nettoyeur de hashtags"
 },
 "hashtag-generator": {
  "description": "Générez jusqu’à 30 hashtags à partir de vos mots-clés, auxquels s’ajoute une banque sélectionnée pour 12 niches — fitness, cuisine, voyage, mode, business et bien plus.",
  "name": "Générateur de hashtags"
 },
 "link-in-bio-builder": {
  "description": "Créez votre propre page de liens en bio et téléchargez-la sous forme d’un seul fichier HTML — hébergez-la gratuitement où vous voulez, sans frais mensuels.",
  "name": "Créateur de page lien en bio"
 },
 "love-calculator": {
  "description": "Saisissez deux prénoms et obtenez votre pourcentage de compatibilité amoureuse — un jeu de prénoms juste pour le plaisir, où les mêmes prénoms donnent toujours le même score.",
  "name": "Calculateur d’amour"
 },
 "periodic-table": {
  "description": "Explorez les 118 éléments — cliquez sur un élément pour afficher son nom, son numéro atomique, sa masse et sa catégorie, avec recherche et groupes codés par couleur.",
  "name": "Tableau périodique interactif"
 },
 "pomodoro-timer": {
  "description": "Étudiez et travaillez par sessions concentrées de 25 minutes avec des pauses automatiques — durées personnalisables et suivi des sessions.",
  "name": "Minuteur Pomodoro"
 },
 "post-card-maker": {
  "description": "Concevez des cartes de publication épurées pour vos miniatures, présentations et aperçus de contenu — thèmes clair et sombre, export en PNG.",
  "name": "Créateur de cartes de publication"
 },
 "post-ideas-generator": {
  "description": "Obtenez un calendrier de contenu de 30 jours prêt à l’emploi pour votre niche — une idée de publication et un format pour chaque jour du mois.",
  "name": "Générateur d’idées de publications sociales"
 },
 "random-number-generator": {
  "description": "Générez des nombres aléatoires dans n’importe quel intervalle, lancez des dés de d4 à d100 et jouez à pile ou face — pour les tirages, les jeux et les décisions.",
  "name": "Générateur de nombres aléatoires"
 },
 "screen-recorder": {
  "description": "Enregistrez votre écran, une fenêtre ou un onglet de navigateur — avec le micro et l’audio du système — puis téléchargez la vidéo. Rien n’est envoyé en ligne.",
  "name": "Enregistreur d’écran"
 },
 "social-image-resizer": {
  "description": "Redimensionnez n’importe quelle image au format exact pour Instagram, X, Facebook, YouTube, LinkedIn, TikTok et Pinterest — recadrage, ajustement ou fond flouté.",
  "name": "Redimensionneur d’images pour réseaux sociaux"
 },
 "social-post-composer": {
  "description": "Rédigez une publication et suivez en direct le nombre de caractères pour X, Instagram, Threads, TikTok, LinkedIn, Facebook, YouTube et Pinterest.",
  "name": "Compositeur de publications sociales"
 },
 "social-video-resizer": {
  "description": "Convertissez n’importe quelle vidéo en 9:16 pour les Reels, TikTok et Shorts, en 1:1 ou 4:5 pour les fils d’actualité, ou en 16:9 — recadrage plein cadre ou remplissage avec un fond flouté.",
  "name": "Redimensionneur de vidéos sociales"
 },
 "speech-to-text": {
  "description": "Dictez en anglais — transcription en direct dans votre navigateur, avec copie et téléchargement.",
  "name": "Reconnaissance vocale"
 },
 "stopwatch-timer": {
  "description": "Un chronomètre précis avec temps intermédiaires et un minuteur à rebours avec alarme — pour le sport, la cuisine, les examens et les présentations.",
  "name": "Chronomètre et minuteur"
 },
 "study-planner": {
  "description": "Saisissez la date de votre examen et vos sujets pour obtenir un plan d’étude jour par jour, avec des jours de repos et de révision intégrés.",
  "name": "Planificateur d’études"
 },
 "text-to-handwriting": {
  "description": "Transformez un texte tapé en pages manuscrites réalistes sur du papier A4 ligné — choisissez la couleur de l’encre et téléchargez des pages prêtes à imprimer.",
  "name": "Convertisseur de texte en écriture manuscrite"
 },
 "text-to-speech": {
  "description": "Écoutez n’importe quel texte lu à voix haute avec des voix système naturelles — choisissez la voix, la vitesse et la hauteur.",
  "name": "Synthèse vocale"
 },
 "typing-speed-test": {
  "description": "Testez votre vitesse de frappe en 30 ou 60 secondes — scores réels en mots par minute et en précision, avec un retour caractère par caractère en direct.",
  "name": "Test de vitesse de frappe"
 },
 "username-generator": {
  "description": "Générez des idées de noms d’utilisateur accrocheurs pour Instagram, TikTok, X et YouTube à partir de n’importe quel mot-clé — préfixes, suffixes et combinaisons stylées.",
  "name": "Générateur de noms d’utilisateur"
 },
 "video-compressor": {
  "description": "Compressez vos vidéos MP4 à une fraction de leur taille grâce aux réglages de qualité et de résolution — sans envoi de fichiers ni limites de taille imposées par un serveur.",
  "name": "Compresseur vidéo"
 },
 "video-converter": {
  "description": "Convertissez vos vidéos entre les formats MP4, WebM et MOV directement dans votre navigateur.",
  "name": "Convertisseur vidéo"
 },
 "video-frame-capture": {
  "description": "Capturez des images fixes et des miniatures à n’importe quel moment d’une vidéo, au format PNG ou JPG.",
  "name": "Capture d’image vidéo"
 },
 "video-to-gif": {
  "description": "Transformez vos clips vidéo en GIF animés de haute qualité avec des réglages de découpe, de largeur et de fréquence d’images — palette optimisée pour des fichiers légers.",
  "name": "Convertisseur vidéo en GIF"
 },
 "video-to-mp3": {
  "description": "Extrayez l’audio de n’importe quelle vidéo en MP3, WAV, M4A ou OGG jusqu’à 320 kbps.",
  "name": "Vidéo en MP3"
 },
 "video-trimmer": {
  "description": "Coupez n’importe quelle section d’une vidéo avec un réencodage précis ou une découpe rapide par copie de flux.",
  "name": "Découpeur vidéo"
 },
 "voice-recorder": {
  "description": "Enregistrez des notes vocales et de l’audio depuis votre microphone avec un indicateur de niveau en direct — sauvegardez un nombre illimité de prises.",
  "name": "Enregistreur vocal"
 },
 "webcam-recorder": {
  "description": "Enregistrez une vidéo depuis votre webcam avec un aperçu en direct et un téléchargement instantané.",
  "name": "Enregistreur webcam"
 },
 "youtube-thumbnail-maker": {
  "description": "Concevez des miniatures YouTube percutantes en 1280×720 avec votre photo, un titre en gros caractères et une barre d’accentuation — aucune compétence en design requise.",
  "name": "Créateur de miniatures YouTube"
 }
};

/** Display name/description for a tool in the active language (falls back to English). */
export function localizedTool(tool: ToolItem, lang: SupportedLanguage): { name: string; description: string } {
  if (lang === 'fr' && TOOLS_FR[tool.slug]) return TOOLS_FR[tool.slug];
  if (lang === 'ar' && TOOLS_AR[tool.slug]) return TOOLS_AR[tool.slug];
  if (lang === 'ru' && TOOLS_RU[tool.slug]) return TOOLS_RU[tool.slug];
  if (lang === 'es' && TOOLS_ES[tool.slug]) return TOOLS_ES[tool.slug];
  const genDesc = localizedGenDescription(tool, lang);
  if (genDesc) return { name: tool.name, description: genDesc };
  return { name: tool.name, description: tool.description };
}
