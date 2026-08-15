/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'en' | 'ar' | 'ur'
const RTL_LANGS: Lang[] = ['ar', 'ur']

const en = {
  heroTitle1: 'Make your videos ',
  heroTitle2: 'buttery smooth',
  heroSub:
    'AI frame interpolation to 60, 120 or 240 fps — running entirely in your browser. No uploads, no accounts, free forever.',
  codedBy: 'Coded By',
  stepUpload: 'Upload',
  stepSettings: 'Settings',
  stepProcess: 'Process',
  stepDownload: 'Download',
  dropTitle: 'Drop your video here',
  dropBusy: 'Reading video…',
  dropOr: 'or',
  dropBrowse: 'browse files',
  dropMeta: 'MP4, MOV, WebM · processed locally, never uploaded',
  change: 'Change',
  muted: 'muted',
  targetFps: 'Target frame rate',
  fps60Tag: 'Recommended for TikTok',
  fps60Desc:
    'The highest rate TikTok actually plays back. Best choice for uploads.',
  fps120Tag: 'High-motion / editing',
  fps120Desc:
    'Great as editing footage or for platforms that support it. TikTok will re-encode it down.',
  fps240Tag: 'Slow-motion master',
  fps240Desc:
    'Maximum smoothness — ideal source for buttery slow-motion edits.',
  tiktokWarn:
    'Heads-up: TikTok caps playback at 60 fps and re-encodes anything higher. 120/240 shines for slow-motion and editing workflows.',
  mode: 'Mode',
  smoothTitle: '✨ Smooth motion',
  smoothDesc: 'Same length & speed, {mult}× more frames. Audio kept.',
  slowmoTitle: '🐢 Slow motion',
  slowmoDesc: '{mult}× slower, silky smooth. Audio removed.',
  clarity: 'Clarity',
  upscaleTitle: '🔍 AI Upscale ×2',
  upscaleDesc:
    'Neural super-resolution doubles the output resolution with sharper details ({from} → {to}). Feeding TikTok a sharper source survives its re-encode better. Roughly doubles processing time.',
  on: 'ON',
  off: 'OFF',
  downscale1080: 'Downscale to 1080p',
  downscale1080Note: "(TikTok's native resolution — much faster processing)",
  alreadyFps:
    'This video is already {fps} fps — choose a higher target to interpolate.',
  boostBtn: 'Boost to {fps} fps →',
  boostUpscaleBtn: 'Boost to {fps} fps + Upscale →',
  enhanceBtn: 'Enhance clarity ×2 →',
  procTitle: 'Generating frames…',
  procSub: 'Your GPU is dreaming up the in-between frames. Keep this tab open.',
  frames: 'frames',
  cancel: 'Cancel',
  boostedTo: 'Boosted to {fps} fps',
  framesX: '{n}× frames',
  aiInterp: 'AI interpolation',
  basicBlend: 'basic blending',
  upscaledTo: 'upscaled to {res}',
  finishedIn: 'finished in {s}s',
  before: 'Before',
  after: 'After',
  downloadBtn: '⬇ Download {fps} fps video',
  shareBtn: '📤 Share',
  studioBtn: '↗ Open TikTok Studio',
  newVideo: 'New video',
  proTip:
    'Pro tip: upload through TikTok Studio for the best quality — download the video, drag it in, and turn on "Allow high-quality uploads" before posting.',
  shareFail: 'Sharing failed — download the file instead.',
  gateTitle: "This browser can't process video",
  gateBody:
    'SmoothFlow runs entirely in your browser and needs the WebCodecs API. Please open this page in Chrome or Edge on a desktop computer. Safari, Firefox and most mobile browsers are not supported yet.',
  footerPrivacy: 'Videos are processed on your device and never leave it.',
  aiModel: 'AI model',
  mediaEngine: 'Media engine',
  nonCommercial: 'non-commercial weights',
}

type Dict = typeof en
export type TKey = keyof Dict

const ar: Dict = {
  heroTitle1: 'اجعل فيديوهاتك ',
  heroTitle2: 'ناعمة كالحرير',
  heroSub:
    'توليد إطارات بالذكاء الاصطناعي إلى 60 أو 120 أو 240 إطارًا في الثانية — يعمل بالكامل داخل متصفحك. بلا رفع ملفات، بلا حسابات، مجاني للأبد.',
  codedBy: 'برمجة',
  stepUpload: 'الرفع',
  stepSettings: 'الإعدادات',
  stepProcess: 'المعالجة',
  stepDownload: 'التحميل',
  dropTitle: 'أسقط الفيديو هنا',
  dropBusy: 'جارٍ قراءة الفيديو…',
  dropOr: 'أو',
  dropBrowse: 'تصفح الملفات',
  dropMeta: 'MP4, MOV, WebM · تتم المعالجة على جهازك، لا يُرفع أي شيء',
  change: 'تغيير',
  muted: 'بدون صوت',
  targetFps: 'معدل الإطارات المستهدف',
  fps60Tag: 'الموصى به لتيك توك',
  fps60Desc: 'أعلى معدل يعرضه تيك توك فعليًا. الخيار الأفضل للنشر.',
  fps120Tag: 'حركة سريعة / مونتاج',
  fps120Desc:
    'ممتاز كمادة مونتاج أو للمنصات الداعمة. تيك توك سيعيد ترميزه للأسفل.',
  fps240Tag: 'ملك السلو موشن',
  fps240Desc: 'أقصى سلاسة — المصدر المثالي للقطات سلو موشن حريرية.',
  tiktokWarn:
    'تنبيه: تيك توك يعرض 60 إطارًا كحد أقصى ويعيد ترميز أي شيء أعلى. قوة 120/240 تظهر في السلو موشن والمونتاج.',
  mode: 'الوضع',
  smoothTitle: '✨ حركة ناعمة',
  smoothDesc: 'نفس المدة والسرعة مع {mult}× إطارات أكثر. الصوت محفوظ.',
  slowmoTitle: '🐢 سلو موشن',
  slowmoDesc: 'أبطأ {mult}× بنعومة حريرية. يُحذف الصوت.',
  clarity: 'الوضوح',
  upscaleTitle: '🔍 ترقية بالذكاء الاصطناعي ×2',
  upscaleDesc:
    'دقة فائقة عصبية تضاعف دقة الفيديو بتفاصيل أكثر حدة ({from} ← {to}). إعطاء تيك توك مصدرًا أكثر حدة يجعل النتيجة بعد إعادة الترميز أنظف. يضاعف زمن المعالجة تقريبًا.',
  on: 'مفعّل',
  off: 'معطّل',
  downscale1080: 'تصغير إلى 1080p',
  downscale1080Note: '(الدقة الأصلية لتيك توك — معالجة أسرع بكثير)',
  alreadyFps: 'هذا الفيديو {fps} إطارًا أصلًا — اختر هدفًا أعلى للتوليد.',
  boostBtn: 'ارفع إلى {fps} إطارًا ←',
  boostUpscaleBtn: 'ارفع إلى {fps} إطارًا + ترقية ←',
  enhanceBtn: 'حسّن الوضوح ×2 ←',
  procTitle: 'جارٍ توليد الإطارات…',
  procSub: 'كرت الشاشة يرسم الإطارات الوسيطة الآن. أبقِ هذا التبويب مفتوحًا.',
  frames: 'إطار',
  cancel: 'إلغاء',
  boostedTo: 'تم الرفع إلى {fps} إطارًا',
  framesX: '{n}× إطارات',
  aiInterp: 'توليد بالذكاء الاصطناعي',
  basicBlend: 'دمج أساسي',
  upscaledTo: 'ترقية إلى {res}',
  finishedIn: 'اكتمل في {s} ثانية',
  before: 'قبل',
  after: 'بعد',
  downloadBtn: '⬇ حمّل فيديو {fps} إطارًا',
  shareBtn: '📤 مشاركة',
  studioBtn: '↗ افتح تيك توك ستوديو',
  newVideo: 'فيديو جديد',
  proTip:
    'نصيحة احترافية: ارفع عبر تيك توك ستوديو لأفضل جودة — حمّل الفيديو واسحبه هناك، وفعّل "Allow high-quality uploads" قبل النشر.',
  shareFail: 'فشلت المشاركة — حمّل الملف بدلًا منها.',
  gateTitle: 'هذا المتصفح لا يستطيع معالجة الفيديو',
  gateBody:
    'يعمل SmoothFlow بالكامل داخل المتصفح ويحتاج واجهة WebCodecs. افتح الصفحة في كروم أو إيدج على كمبيوتر مكتبي. سفاري وفايرفوكس وأغلب متصفحات الجوال غير مدعومة بعد.',
  footerPrivacy: 'تُعالج الفيديوهات على جهازك ولا تغادره أبدًا.',
  aiModel: 'نموذج الذكاء الاصطناعي',
  mediaEngine: 'محرك الوسائط',
  nonCommercial: 'أوزان غير تجارية',
}

const ur: Dict = {
  heroTitle1: 'اپنی ویڈیوز کو بنائیں ',
  heroTitle2: 'مکھن جیسی ہموار',
  heroSub:
    'AI فریم انٹرپولیشن سے 60، 120 یا 240 fps تک — مکمل طور پر آپ کے براؤزر میں۔ نہ اپ لوڈ، نہ اکاؤنٹ، ہمیشہ کے لیے مفت۔',
  codedBy: 'کوڈ از',
  stepUpload: 'اپ لوڈ',
  stepSettings: 'ترتیبات',
  stepProcess: 'پروسیس',
  stepDownload: 'ڈاؤن لوڈ',
  dropTitle: 'اپنی ویڈیو یہاں ڈالیں',
  dropBusy: 'ویڈیو پڑھی جا رہی ہے…',
  dropOr: 'یا',
  dropBrowse: 'فائلیں براؤز کریں',
  dropMeta: 'MP4, MOV, WebM · مقامی پروسیسنگ، کبھی اپ لوڈ نہیں ہوتی',
  change: 'تبدیل کریں',
  muted: 'بغیر آواز',
  targetFps: 'ہدف فریم ریٹ',
  fps60Tag: 'TikTok کے لیے تجویز کردہ',
  fps60Desc:
    'سب سے زیادہ ریٹ جو TikTok واقعی چلاتا ہے۔ اپ لوڈ کے لیے بہترین انتخاب۔',
  fps120Tag: 'تیز حرکت / ایڈیٹنگ',
  fps120Desc:
    'ایڈیٹنگ فوٹیج یا معاون پلیٹ فارمز کے لیے بہترین۔ TikTok اسے نیچے ری اینکوڈ کرے گا۔',
  fps240Tag: 'سلو موشن ماسٹر',
  fps240Desc: 'زیادہ سے زیادہ ہمواری — شاندار سلو موشن کے لیے مثالی ماخذ۔',
  tiktokWarn:
    'خیال رہے: TikTok زیادہ سے زیادہ 60 fps چلاتا ہے اور اس سے اوپر کو ری اینکوڈ کر دیتا ہے۔ 120/240 کا کمال سلو موشن اور ایڈیٹنگ میں ہے۔',
  mode: 'موڈ',
  smoothTitle: '✨ ہموار حرکت',
  smoothDesc: 'وہی دورانیہ اور رفتار، {mult}× زیادہ فریم۔ آواز برقرار۔',
  slowmoTitle: '🐢 سلو موشن',
  slowmoDesc: '{mult}× سست، ریشم جیسی ہموار۔ آواز حذف ہو جاتی ہے۔',
  clarity: 'وضاحت',
  upscaleTitle: '🔍 AI اپ اسکیل ×2',
  upscaleDesc:
    'نیورل سپر ریزولوشن ویڈیو کی ریزولوشن دوگنی اور تفصیلات تیز کرتی ہے ({from} ← {to})۔ تیز ماخذ TikTok کی ری اینکوڈنگ میں بہتر رہتا ہے۔ پروسیسنگ کا وقت تقریباً دوگنا۔',
  on: 'آن',
  off: 'آف',
  downscale1080: '1080p تک گھٹائیں',
  downscale1080Note: '(TikTok کی اصل ریزولوشن — کہیں تیز پروسیسنگ)',
  alreadyFps:
    'یہ ویڈیو پہلے ہی {fps} fps ہے — انٹرپولیشن کے لیے بلند ہدف چنیں۔',
  boostBtn: '{fps} fps تک بڑھائیں ←',
  boostUpscaleBtn: '{fps} fps + اپ اسکیل ←',
  enhanceBtn: 'وضاحت بہتر کریں ×2 ←',
  procTitle: 'فریم بن رہے ہیں…',
  procSub:
    'آپ کا GPU درمیانی فریم تیار کر رہا ہے۔ یہ ٹیب کھلا رکھیں۔',
  frames: 'فریم',
  cancel: 'منسوخ',
  boostedTo: '{fps} fps تک بڑھا دیا گیا',
  framesX: '{n}× فریم',
  aiInterp: 'AI انٹرپولیشن',
  basicBlend: 'بنیادی بلینڈنگ',
  upscaledTo: '{res} تک اپ اسکیل',
  finishedIn: '{s} سیکنڈ میں مکمل',
  before: 'پہلے',
  after: 'بعد',
  downloadBtn: '⬇ {fps} fps ویڈیو ڈاؤن لوڈ کریں',
  shareBtn: '📤 شیئر',
  studioBtn: '↗ TikTok اسٹوڈیو کھولیں',
  newVideo: 'نئی ویڈیو',
  proTip:
    'ماہرانہ مشورہ: بہترین معیار کے لیے TikTok اسٹوڈیو سے اپ لوڈ کریں — ویڈیو ڈاؤن لوڈ کر کے وہاں ڈالیں اور پوسٹ سے پہلے "Allow high-quality uploads" آن کریں۔',
  shareFail: 'شیئرنگ ناکام — فائل ڈاؤن لوڈ کر لیں۔',
  gateTitle: 'یہ براؤزر ویڈیو پروسیس نہیں کر سکتا',
  gateBody:
    'SmoothFlow مکمل طور پر براؤزر میں چلتا ہے اور WebCodecs API چاہیے۔ براہ کرم یہ صفحہ ڈیسک ٹاپ پر Chrome یا Edge میں کھولیں۔ Safari، Firefox اور بیشتر موبائل براؤزر ابھی معاون نہیں۔',
  footerPrivacy:
    'ویڈیوز آپ کے آلے پر پروسیس ہوتی ہیں اور کبھی باہر نہیں جاتیں۔',
  aiModel: 'AI ماڈل',
  mediaEngine: 'میڈیا انجن',
  nonCommercial: 'غیر تجارتی ویٹس',
}

const dicts: Record<Lang, Dict> = { en, ar, ur }

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'عربي' },
  { code: 'ur', label: 'اردو' },
]

interface I18n {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey, vars?: Record<string, string | number>) => string
  rtl: boolean
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('sf-lang')
    return saved === 'ar' || saved === 'ur' || saved === 'en' ? saved : 'en'
  })

  useEffect(() => {
    localStorage.setItem('sf-lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'
  }, [lang])

  const t = (key: TKey, vars?: Record<string, string | number>) => {
    let s: string = dicts[lang][key] ?? dicts.en[key]
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v))
      }
    }
    return s
  }

  return (
    <I18nContext.Provider
      value={{ lang, setLang, t, rtl: RTL_LANGS.includes(lang) }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n outside I18nProvider')
  return ctx
}
