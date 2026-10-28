import type { Difficulty, Question, QuestionType } from '../types'

type Draft = Omit<Question, 'id'>

const banks: Record<string, Draft[]> = {
  'الرياضيات': [
    { text: 'ما قيمة النهاية lim x→3 (x² − 9) / (x − 3)؟', type: 'mcq', options: ['0', '3', '6', 'غير موجودة'], correctIndex: 2, marks: 2, difficulty: 'easy', skill: 'النهايات' },
    { text: 'مشتقة الدالة f(x) = 4x³ − 2x هي:', type: 'mcq', options: ['12x² − 2', '4x² − 2', '12x − 2', '12x³ − 2x'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'الاشتقاق' },
    { text: 'إذا كانت f(x) = cos x فإن f′(x) = −sin x.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'الاشتقاق' },
    { text: 'النقطة الحرجة للدالة f(x) = x² − 4x هي عند x =', type: 'mcq', options: ['−2', '0', '2', '4'], correctIndex: 2, marks: 2, difficulty: 'medium', skill: 'تطبيقات المشتقة' },
    { text: '∫ (3x² + 1) dx =', type: 'mcq', options: ['x³ + x + C', '3x³ + x + C', 'x³ + C', '6x + C'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'التكامل' },
    { text: 'إذا كانت المشتقة الثانية عند نقطة سالبة، فإن النقطة تكون صغرى محلية.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 1, marks: 1, difficulty: 'hard', skill: 'تطبيقات المشتقة' },
    { text: 'ميل المماس لمنحنى f(x) = x² عند x = 3 يساوي:', type: 'mcq', options: ['3', '6', '9', '12'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'الاشتقاق' },
    { text: 'مساحة المنطقة المحصورة بين المنحنى y = x² والمحور x من 0 إلى 2 تساوي:', type: 'mcq', options: ['8/3', '4', '2/3', '16/3'], correctIndex: 0, marks: 2, difficulty: 'hard', skill: 'التكامل' },
  ],
  'الفيزياء': [
    { text: 'وحدة قياس التسارع في النظام الدولي هي:', type: 'mcq', options: ['م/ث', 'م/ث²', 'نيوتن', 'جول'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'الحركة' },
    { text: 'ينص قانون نيوتن الثاني على أن القوة تساوي الكتلة مضروبة في:', type: 'mcq', options: ['السرعة', 'التسارع', 'الإزاحة', 'الزمن'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'قوانين نيوتن' },
    { text: 'طاقة الحركة لجسم كتلته ٢ كجم وسرعته ٣ م/ث تساوي ٩ جول.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'الطاقة' },
    { text: 'جسم يتحرك بسرعة ثابتة في خط مستقيم، فإن محصلة القوى المؤثرة عليه:', type: 'mcq', options: ['تساوي صفرًا', 'تتزايد', 'تتناقص', 'تساوي وزنه'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'قوانين نيوتن' },
    { text: 'في الحركة الدائرية المنتظمة، السرعة المتجهة ثابتة.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 1, marks: 1, difficulty: 'hard', skill: 'الحركة الدائرية' },
    { text: 'الشغل المبذول عندما تكون القوة عمودية على الإزاحة يساوي:', type: 'mcq', options: ['صفرًا', 'القوة × المسافة', 'أكبر ما يمكن', 'سالبة دائمًا'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'الشغل' },
  ],
  'الكيمياء': [
    { text: 'عدد البروتونات في ذرة الكربون ¹²C يساوي:', type: 'mcq', options: ['٤', '٦', '١٢', '١٨'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'التركيب الذري' },
    { text: 'الرابطة الأيونية تنشأ بين فلز ولافلز.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'easy', skill: 'الروابط' },
    { text: 'الصيغة العامة للألكانات هي:', type: 'mcq', options: ['CnH2n', 'CnH2n+2', 'CnH2n−2', 'CnHn'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'الكيمياء العضوية' },
    { text: 'المحلول الذي يحتوي على تركيز عالٍ من أيونات الهيدروجين يكون:', type: 'mcq', options: ['قاعديًا', 'متعادلًا', 'حمضيًا', 'ملحيًا'], correctIndex: 2, marks: 2, difficulty: 'easy', skill: 'الحموض والقواعد' },
    { text: 'عدد المولات في ٤٤ جرام من ثاني أكسيد الكربون CO₂ يساوي ١ مول.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'الحسابات الكيميائية' },
    { text: 'العامل الحفاز يزيد من سرعة التفاعل عن طريق:', type: 'mcq', options: ['رفع طاقة التنشيط', 'خفض طاقة التنشيط', 'زيادة كتلة النواتج', 'تغيير نوع التفاعل'], correctIndex: 1, marks: 2, difficulty: 'hard', skill: 'سرعة التفاعل' },
  ],
  'الأحياء': [
    { text: 'العضية المسؤولة عن إنتاج الطاقة في الخلية هي:', type: 'mcq', options: ['النواة', 'الميتوكوندريا', 'الريبوسوم', 'الفجوة'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'الخلية' },
    { text: 'DNA يحمل المادة الوراثية في الخلية.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'easy', skill: 'الوراثة' },
    { text: 'عملية صنع البروتين تحدث في:', type: 'mcq', options: ['الميتوكوندريا', 'الريبوسومات', 'الجسم الجولجي', 'الليسوسوم'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'الخلية' },
    { text: 'في الانقسام الميتوزي ينتج خليتان متطابقتان وراثيًا.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'الانقسام الخلوي' },
    { text: 'الجين السائد يظهر أثره حتى لو وُجد جين متنحٍّ معه.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'الوراثة' },
    { text: 'التركيب المسؤول عن دخول المواد إلى الخلية هو:', type: 'mcq', options: ['الغشاء البلازمي', 'النواة', 'النوية', 'الشبكة الإندوبلازمية'], correctIndex: 0, marks: 2, difficulty: 'hard', skill: 'الخلية' },
  ],
  'اللغة العربية': [
    { text: '«نجح الطالبُ» — كلمة «الطالبُ» تعرب:', type: 'mcq', options: ['فاعلًا مرفوعًا', 'مفعولًا به منصوبًا', 'مبتدأً مرفوعًا', 'خبرًا'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'النحو' },
    { text: 'الاستعارة هي تشبيه حُذف أحد طرفيه.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'البلاغة' },
    { text: '«العلم نور» — الصورة البيانية:', type: 'mcq', options: ['تشبيه بليغ', 'كناية', 'مجاز مرسل', 'استعارة مكنية'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'البلاغة' },
    { text: 'علامة إعراب جمع المؤنث السالم في حالة النصب هي:', type: 'mcq', options: ['الفتحة', 'الكسرة', 'الضمة', 'الياء'], correctIndex: 1, marks: 2, difficulty: 'hard', skill: 'النحو' },
    { text: 'الفعل «كتب» فعل لازم لا يحتاج إلى مفعول به.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 1, marks: 1, difficulty: 'medium', skill: 'النحو' },
    { text: 'في جملة «قرأتُ الكتابين»، علامة إعراب «الكتابين»:', type: 'mcq', options: ['الفتحة', 'الياء', 'الكسرة', 'الألف'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'النحو' },
  ],
  'اللغة الإنجليزية': [
    { text: 'Choose the correct form: She ____ to school every day.', type: 'mcq', options: ['go', 'goes', 'going', 'gone'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'Present Simple' },
    { text: 'The past participle of "write" is "wrote".', type: 'truefalse', options: ['True', 'False'], correctIndex: 1, marks: 1, difficulty: 'easy', skill: 'Irregular Verbs' },
    { text: 'I have lived here ____ 2019.', type: 'mcq', options: ['for', 'since', 'from', 'during'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'Prepositions' },
    { text: 'Choose the correct tag: You are coming, ____?', type: 'mcq', options: ["aren't you", "don't you", "isn't it", "are you"], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'Question Tags' },
    { text: '“Advice” is a verb and “advise” is a noun.', type: 'truefalse', options: ['True', 'False'], correctIndex: 1, marks: 1, difficulty: 'hard', skill: 'Word Forms' },
    { text: 'The passive form of "They built the bridge" is:', type: 'mcq', options: ['The bridge was built', 'The bridge is building', 'The bridge built', 'They were built'], correctIndex: 0, marks: 2, difficulty: 'hard', skill: 'Passive Voice' },
  ],
  'التاريخ': [
    { text: 'بدأت الحرب العالمية الأولى في عام:', type: 'mcq', options: ['١٩١٢', '١٩١٤', '١٩١٨', '١٩٣٩'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'الحروب العالمية' },
    { text: 'الثورة الفرنسية بدأت عام ١٧٨٩.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'الثورات' },
    { text: 'من أسباب الحرب العالمية الأولى:', type: 'mcq', options: ['التحالفات والسباق العسكري', 'المحراث البخاري', 'اختراع الطباعة', 'الثورة الصناعية الثانية'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'الحروب العالمية' },
    { text: 'معاهدة فرساي وُقعت بعد الحرب العالمية:', type: 'mcq', options: ['الأولى', 'الثانية', 'الكورية', 'الباردة'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'المعاهدات' },
    { text: 'الحرب الباردة كانت مواجهة عسكرية مباشرة بين أمريكا والاتحاد السوفيتي.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 1, marks: 1, difficulty: 'hard', skill: 'الحرب الباردة' },
  ],
  'علوم الحاسب': [
    { text: 'أي مما يلي يستخدم لتكرار كتلة من الكود عددًا معروفًا من المرات؟', type: 'mcq', options: ['for', 'if', 'function', 'return'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'التحكم في المسار' },
    { text: 'المتغير من نوع String يمكنه تخزين رقم صحيح فقط.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 1, marks: 1, difficulty: 'easy', skill: 'أنواع البيانات' },
    { text: 'ناتج 5 % 2 في معظم لغات البرمجة هو:', type: 'mcq', options: ['0', '1', '2', '2.5'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'العمليات' },
    { text: 'الدالة (Function) تساعد على:', type: 'mcq', options: ['تكرار الكود', 'إعادة استخدام الكود', 'حذف الكود', 'إخفاء الأخطاء'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'الدوال' },
    { text: 'المصفوفة (Array) تبدأ فهرستها من العنصر رقم ٠ في معظم اللغات.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'المصفوفات' },
    { text: 'أي بنية بيانات تعمل بمبدأ «آخر ما يدخل أول ما يخرج»؟', type: 'mcq', options: ['Queue', 'Stack', 'Array', 'Tree'], correctIndex: 1, marks: 2, difficulty: 'hard', skill: 'بنية البيانات' },
  ],
}

const fallback: Draft[] = [
  { text: 'الفكرة الرئيسية التي يعبر عنها النص هي:', type: 'mcq', options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'الفهم' },
  { text: 'يمكن تطبيق هذا المفهوم في مواقف حياتية مختلفة.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'easy', skill: 'التطبيق' },
  { text: 'أي العبارات التالية غير صحيحة وفقًا للمادة؟', type: 'mcq', options: ['العبارة أ', 'العبارة ب', 'العبارة ج', 'العبارة د'], correctIndex: 2, marks: 2, difficulty: 'hard', skill: 'التحليل' },
]

export function generateQuestions(subjectName: string, count: number, difficulty?: Difficulty | 'mixed', types?: QuestionType[]): Question[] {
  const bank = banks[subjectName] ?? fallback
  let pool = bank
  if (difficulty && difficulty !== 'mixed') pool = bank.filter((q) => q.difficulty === difficulty)
  if (pool.length < count) pool = bank
  if (types && types.length) {
    const typed = pool.filter((q) => types.includes(q.type))
    if (typed.length >= Math.min(3, count)) pool = typed
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return Array.from({ length: count }, (_, i) => {
    const draft = shuffled[i % shuffled.length]
    return { ...draft, id: `ai_q_${Date.now()}_${i}` }
  })
}
