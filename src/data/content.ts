import type {
  Announcement, AttendanceRecord, AuditEntry, Exam, ExamAttempt, Notification, Reel, SkillScore, Subscription,
} from '../types'
import { schools, students } from './users'

const iso = (d: Date) => d.toISOString().slice(0, 10)
const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return iso(d)
}
const daysAhead = (n: number) => daysAgo(-n)

export const reels: Reel[] = [
  {
    id: 'reel_1', teacherId: 'tch_1', subjectId: 'sub_math', title: 'خدعة النهايات في ٣٠ ثانية 🤯',
    description: 'أسهل طريقة لحل نهايات الكسور باستخدام التحليل — جربها في الامتحان الجاي.',
    duration: 42, views: 12400, likes: 1820, comments: 96, saves: 430, createdAt: daysAgo(1),
    gradient: 'from-indigo-600 via-violet-600 to-fuchsia-500', emoji: '∫',
    tags: ['النهايات', 'رياضيات', 'الصف الثاني'],
    transcript: ['لو شفت كسر فيه صفر على صفر، متخافش…', 'حلل البسط أولًا، واشطب العامل المشترك.', 'بعدها عوّض مباشرة وهتلاقي الناتج!', 'جرب تحل (x²-9)/(x-3) بنفسك 👇'],
  },
  {
    id: 'reel_2', teacherId: 'tch_2', subjectId: 'sub_physics', title: 'ليه القمر مبيقعش علينا؟ 🌙',
    description: 'شرح الحركة الدائرية وقوة الجذب المركزي في تجربة بسيطة.',
    duration: 58, views: 8900, likes: 1240, comments: 71, saves: 290, createdAt: daysAgo(2),
    gradient: 'from-sky-500 via-blue-600 to-indigo-700', emoji: '🪐',
    tags: ['فيزياء', 'الحركة الدائرية'],
    transcript: ['القمر بيقع فعلًا… بس بيخطئ الأرض كل مرة!', 'السرعة الأفقية بتخليه يفضل في مداره.', 'زي ما تلف كورة بحبل، كل ما تسرع الحبل يشد أكتر.'],
  },
  {
    id: 'reel_3', teacherId: 'tch_3', subjectId: 'sub_chem', title: 'معادلة كيميائية في ٤ خطوات ⚗️',
    description: 'موازنة المعادلات الكيميائية بطريقة لن تنساها.',
    duration: 51, views: 6200, likes: 980, comments: 54, saves: 210, createdAt: daysAgo(3),
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600', emoji: '⚗️',
    tags: ['كيمياء', 'موازنة المعادلات'],
    transcript: ['ابدأ بالعنصر اللي ظاهر مرة واحدة في كل طرف.', 'وازن الهيدروجين قبل الأكسجين.', 'وأخيرًا تأكد إن مجموع الذرات متساوي.'],
  },
  {
    id: 'reel_4', teacherId: 'tch_5', subjectId: 'sub_ar', title: 'إعراب الفاعل والمفعول في دقيقة ✍️',
    description: 'قاعدة سهلة لتحديد الفاعل والمفعول به بدون حيرة.',
    duration: 47, views: 15200, likes: 2310, comments: 148, saves: 610, createdAt: daysAgo(4),
    gradient: 'from-amber-500 via-orange-500 to-rose-500', emoji: '✍️',
    tags: ['لغة عربية', 'نحو'],
    transcript: ['اسأل نفسك: مين اللي عمل الفعل؟ ده الفاعل.', 'واسأل: الفعل وقع على إيه؟ ده المفعول به.', 'سهلة صح؟ جرب تطبق على جملة من عندك.'],
  },
  {
    id: 'reel_5', teacherId: 'tch_8', subjectId: 'sub_cs', title: 'اكتب أول حلقة Loop صح 💻',
    description: 'الفرق بين while و for ومتى تستخدم كل واحدة.',
    duration: 63, views: 5400, likes: 760, comments: 39, saves: 180, createdAt: daysAgo(5),
    gradient: 'from-violet-600 via-purple-600 to-indigo-700', emoji: '⌨️',
    tags: ['برمجة', 'حاسب آلي'],
    transcript: ['لو عارف عدد التكرارات، استخدم for.', 'لو مش عارف، استخدم while وحافظ على شرط الخروج.', 'وأهم نصيحة: تجنب الـ infinite loop!'],
  },
  {
    id: 'reel_6', teacherId: 'tch_1', subjectId: 'sub_math', title: 'المشتقة ببساطة… بدون حفظ 🧠',
    description: 'تفسير هندسي لفكرة المشتقة يخليك تحلها بفهم مش بحفظ.',
    duration: 55, views: 9700, likes: 1450, comments: 83, saves: 390, createdAt: daysAgo(6),
    gradient: 'from-fuchsia-600 via-pink-600 to-rose-500', emoji: '📈',
    tags: ['المشتقة', 'رياضيات'],
    transcript: ['المشتقة هي ميل المماس عند نقطة.', 'كل ما تقرب نقطتين، الميل يقرب من الحقيقة.', 'عشان كده بنقول نهاية معدل التغير.'],
  },
  {
    id: 'reel_7', teacherId: 'tch_6', subjectId: 'sub_en', title: 'Stop saying "I am agree" ❌',
    description: '٣ أخطاء إنجليزية شائعة جدًا وصحتها في ثواني.',
    duration: 38, views: 21000, likes: 3800, comments: 212, saves: 940, createdAt: daysAgo(7),
    gradient: 'from-rose-500 via-pink-600 to-purple-600', emoji: '🇬🇧',
    tags: ['English', 'Grammar'],
    transcript: ['Say "I agree", not "I am agree".', 'Say "I have been here", not "I am here since".', 'And remember: advice is a noun, advise is a verb.'],
  },
  {
    id: 'reel_8', teacherId: 'tch_4', subjectId: 'sub_bio', title: 'رحلة داخل الخلية 🧬',
    description: 'جولة سريعة في مكونات الخلية ووظيفة كل جزء.',
    duration: 60, views: 7300, likes: 1010, comments: 47, saves: 260, createdAt: daysAgo(8),
    gradient: 'from-teal-500 via-emerald-600 to-green-700', emoji: '🧬',
    tags: ['أحياء', 'الخلية'],
    transcript: ['النواة… مركز التحكم في كل شيء.', 'الميتوكوندريا… محطة الطاقة.', 'والريبوسومات… مصنع البروتين.'],
  },
  {
    id: 'reel_9', teacherId: 'tch_7', subjectId: 'sub_hist', title: 'ليش قامت الحرب العالمية الأولى؟ 🌍',
    description: 'الأسباب الحقيقية وراء الحرب في ٤ نقاط.',
    duration: 66, views: 4800, likes: 620, comments: 35, saves: 150, createdAt: daysAgo(9),
    gradient: 'from-orange-500 via-red-500 to-rose-600', emoji: '🏛️',
    tags: ['تاريخ', 'الحرب العالمية'],
    transcript: ['التحالفات… كوّنت شبكة معقدة من الالتزامات.', 'السباق العسكري… كل دولة بتحاول تتفوق.', 'والحادث الأخير… كان الشرارة فقط.'],
  },
]

const mathQuestions: Exam['questions'] = [
  { id: 'q1', text: 'ما قيمة النهاية lim x→2 (x² − 4) / (x − 2) ؟', type: 'mcq', options: ['0', '2', '4', 'غير موجودة'], correctIndex: 2, marks: 2, difficulty: 'easy', skill: 'النهايات' },
  { id: 'q2', text: 'مشتقة الدالة f(x) = 3x² + 2x هي:', type: 'mcq', options: ['6x + 2', '3x + 2', '6x² + 2', '6x'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'الاشتقاق' },
  { id: 'q3', text: 'إذا كانت f(x) = sin x فإن f′(x) تساوي:', type: 'mcq', options: ['cos x', '−cos x', 'sin x', '−sin x'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'الاشتقاق' },
  { id: 'q4', text: 'تكون الدالة f(x) = x³ متزايدة دائمًا على مجالها.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'medium', skill: 'تطبيقات المشتقة' },
  { id: 'q5', text: 'القيمة العظمى للدالة f(x) = −x² + 4x هي:', type: 'mcq', options: ['2', '4', '6', '8'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'تطبيقات المشتقة' },
  { id: 'q6', text: 'تكامل ∫ 2x dx يساوي:', type: 'mcq', options: ['x² + C', '2x² + C', 'x + C', '2 + C'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'التكامل' },
  { id: 'q7', text: 'المشتقة الثانية تُستخدم لتحديد نوع النقطة الحرجة (عظمى أم صغرى).', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 1, difficulty: 'hard', skill: 'تطبيقات المشتقة' },
]

const physicsQuestions: Exam['questions'] = [
  { id: 'pq1', text: 'القوة التي تحافظ على الجسم في مسار دائري تتجه دائمًا نحو:', type: 'mcq', options: ['المماس للمسار', 'مركز الدائرة', 'خارج الدائرة', 'الأعلى'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'الحركة الدائرية' },
  { id: 'pq2', text: 'وحدة قياس العجلة المركزية هي:', type: 'mcq', options: ['م/ث', 'م/ث²', 'نيوتن', 'جول'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'الحركة الدائرية' },
  { id: 'pq3', text: 'إذا تضاعفت سرعة جسم يتحرك دائريًا، فإن العجلة المركزية تتضاعف ٤ مرات.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'الحركة الدائرية' },
  { id: 'pq4', text: 'جسم كتلته ٢ كجم يتحرك بسرعة ٤ م/ث في دائرة نصف قطرها ٢ م. القوة المركزية تساوي:', type: 'mcq', options: ['٨ نيوتن', '١٦ نيوتن', '٤ نيوتن', '٣٢ نيوتن'], correctIndex: 1, marks: 2, difficulty: 'hard', skill: 'تطبيقات القوة' },
  { id: 'pq5', text: 'قوة الجذب المركزي تقوم بشغل على الجسم لأنها عمودية على الإزاحة.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'الشغل والطاقة' },
]

const arabicQuestions: Exam['questions'] = [
  { id: 'aq1', text: 'في جملة «كتب الطالبُ الدرسَ»، كلمة «الطالبُ» تعرب:', type: 'mcq', options: ['فاعلًا مرفوعًا', 'مفعولًا به منصوبًا', 'مبتدأً مرفوعًا', 'خبرًا مرفوعًا'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'النحو' },
  { id: 'aq2', text: 'الاستعارة هي تشبيه حُذف فيه أحد طرفي التشبيه.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'البلاغة' },
  { id: 'aq3', text: 'أي مما يلي يعد من علامات إعراب الفاعل؟', type: 'mcq', options: ['الفتحة', 'الضمة', 'الكسرة', 'السكون'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'النحو' },
  { id: 'aq4', text: '«العلم نور» — الصورة البيانية في الجملة هي:', type: 'mcq', options: ['تشبيه بليغ', 'كناية', 'مجاز مرسل', 'استعارة مكنية'], correctIndex: 0, marks: 2, difficulty: 'hard', skill: 'البلاغة' },
]

const chemQuestions: Exam['questions'] = [
  { id: 'cq1', text: 'عدد ذرات الكربون في جزيء الإيثان C₂H₆ هو:', type: 'mcq', options: ['١', '٢', '٦', '٨'], correctIndex: 1, marks: 2, difficulty: 'easy', skill: 'الكيمياء العضوية' },
  { id: 'cq2', text: 'الرابطة بين ذرتي الكربون في الإيثين رابطة:', type: 'mcq', options: ['أحادية', 'ثنائية', 'ثلاثية', 'أيونية'], correctIndex: 1, marks: 2, difficulty: 'medium', skill: 'الكيمياء العضوية' },
  { id: 'cq3', text: 'الألكانات مشبعة لأن جميع روابطها أحادية.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'تصنيف المركبات' },
  { id: 'cq4', text: 'الصيغة العامة للألكينات هي:', type: 'mcq', options: ['CnH2n+2', 'CnH2n', 'CnH2n−2', 'CnHn'], correctIndex: 1, marks: 2, difficulty: 'hard', skill: 'الكيمياء العضوية' },
]

const geometryQuestions: Exam['questions'] = [
  { id: 'gq1', text: 'معادلة الدائرة التي مركزها (٠، ٠) ونصف قطرها ٣ هي:', type: 'mcq', options: ['x² + y² = 9', 'x² + y² = 3', 'x + y = 9', 'x² − y² = 9'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'الدائرة' },
  { id: 'gq2', text: 'ميل المستقيم العمودي على مستقيم ميله ٢ هو:', type: 'mcq', options: ['٢', '−٢', '١/٢', '−١/٢'], correctIndex: 3, marks: 2, difficulty: 'medium', skill: 'المستقيمات' },
  { id: 'gq3', text: 'المسافة بين النقطتين (٠، ٠) و(٣، ٤) تساوي ٥.', type: 'truefalse', options: ['صحيح', 'خطأ'], correctIndex: 0, marks: 2, difficulty: 'easy', skill: 'المسافات' },
]

export const exams: Exam[] = [
  {
    id: 'ex_1', schoolId: 'sch_1', teacherId: 'tch_1', subjectId: 'sub_math', classId: 'c3',
    title: 'اختبار الرياضيات — التفاضل والتكامل', description: 'اختبار شامل على النهايات والاشتقاق وتطبيقاته، تم إنشاؤه بالذكاء الاصطناعي من مذكرة الفصل.',
    durationMin: 30, totalMarks: mathQuestions.reduce((s, q) => s + q.marks, 0), questions: mathQuestions,
    status: 'published', dueDate: daysAhead(2), createdAt: daysAgo(6), source: 'ai', attempts: 18, averageScore: 82,
    materials: ['مذكرة_التفاضل_الفصل_الثالث.pdf', 'مراجعة_النهايات.docx'],
  },
  {
    id: 'ex_2', schoolId: 'sch_1', teacherId: 'tch_1', subjectId: 'sub_math', classId: 'c3',
    title: 'كويز سريع: النهايات والاتصال', description: 'كويز قصير لقياس مستوى الفصل في درس النهايات.',
    durationMin: 15, totalMarks: 8, questions: mathQuestions.slice(0, 4),
    status: 'closed', dueDate: daysAgo(3), createdAt: daysAgo(10), source: 'ai', attempts: 24, averageScore: 76,
  },
  {
    id: 'ex_3', schoolId: 'sch_1', teacherId: 'tch_2', subjectId: 'sub_physics', classId: 'c3',
    title: 'اختبار الفيزياء — الحركة الدائرية', description: 'اختبار على قوانين الحركة الدائرية والقوة المركزية.',
    durationMin: 25, totalMarks: 10, questions: physicsQuestions,
    status: 'published', dueDate: daysAhead(4), createdAt: daysAgo(3), source: 'manual', attempts: 4, averageScore: 74,
  },
  {
    id: 'ex_4', schoolId: 'sch_1', teacherId: 'tch_5', subjectId: 'sub_ar', classId: 'c3',
    title: 'تحليل نص أدبي — طه حسين', description: 'أسئلة على النحو والبلاغة وتحليل النص.',
    durationMin: 20, totalMarks: 8, questions: arabicQuestions,
    status: 'published', dueDate: daysAhead(7), createdAt: daysAgo(2), source: 'manual', attempts: 0, averageScore: 0,
  },
  {
    id: 'ex_5', schoolId: 'sch_1', teacherId: 'tch_1', subjectId: 'sub_math', classId: 'c4',
    title: 'مراجعة الهندسة التحليلية', description: 'مراجعة سريعة على الدائرة والمستقيمات.',
    durationMin: 20, totalMarks: 6, questions: geometryQuestions,
    status: 'published', dueDate: daysAhead(5), createdAt: daysAgo(4), source: 'manual', attempts: 11, averageScore: 79,
  },
  {
    id: 'ex_6', schoolId: 'sch_1', teacherId: 'tch_3', subjectId: 'sub_chem', classId: 'c3',
    title: 'اختبار الكيمياء العضوية', description: 'اختبار على الألكانات والألكينات.',
    durationMin: 25, totalMarks: 8, questions: chemQuestions,
    status: 'published', dueDate: daysAhead(6), createdAt: daysAgo(1), source: 'ai', attempts: 7, averageScore: 71,
  },
  {
    id: 'ex_7', schoolId: 'sch_1', teacherId: 'tch_1', subjectId: 'sub_math', classId: 'c3',
    title: 'اختبار تجريبي — الوحدة الرابعة', description: 'مسودة قيد التجهيز.',
    durationMin: 40, totalMarks: 0, questions: [],
    status: 'draft', dueDate: daysAhead(12), createdAt: daysAgo(0), source: 'ai', attempts: 0, averageScore: 0,
  },
]

function attemptsFor(exam: Exam, count: number): ExamAttempt[] {
  const list = students.filter((s) => s.classId === exam.classId).slice(0, count)
  return list.map((s, i) => {
    const ratio = Math.min(0.98, 0.5 + (s.average / 100) * 0.45 - (i % 3) * 0.02)
    const score = Math.round(exam.totalMarks * ratio)
    const answers: Record<string, number> = {}
    exam.questions.forEach((q, qi) => {
      const wrong = (s.id.charCodeAt(4) + qi) % 4 === 0
      answers[q.id] = wrong ? (q.correctIndex + 1) % q.options.length : q.correctIndex
    })
    return {
      id: `att_${exam.id}_${s.id}`, examId: exam.id, studentId: s.id, score, total: exam.totalMarks,
      answers, submittedAt: daysAgo(1 + (i % 4)), timeSpentMin: Math.max(6, exam.durationMin - (i % 8)),
    }
  })
}

export const attempts: ExamAttempt[] = [
  ...attemptsFor(exams[0], 12),
  ...attemptsFor(exams[1], 12),
  ...attemptsFor(exams[2], 5),
  ...attemptsFor(exams[4], 6),
  ...attemptsFor(exams[5], 6),
]

// Attendance for the last 30 weekdays
export const attendance: AttendanceRecord[] = []
let attendanceId = 1
for (let d = 1; d <= 42; d++) {
  const date = new Date()
  date.setDate(date.getDate() - d)
  const day = date.getDay()
  if (day === 5 || day === 6) continue
  students.forEach((s, si) => {
    let status: AttendanceRecord['status'] = 'present'
    const seed = (d * 7 + si * 13) % 100
    if (seed < 6) status = 'absent'
    else if (seed < 11) status = 'late'
    else if (seed < 13) status = 'excused'
    if (s.id === 'stu_1' && d === 9) status = 'absent'
    if (s.id === 'stu_1' && d === 23) status = 'absent'
    if (s.id === 'stu_1' && d === 15) status = 'late'
    if (s.id === 'stu_2' && d === 18) status = 'absent'
    attendance.push({
      id: `attd_${attendanceId++}`, studentId: s.id, classId: s.classId, date: iso(date), status,
    })
  })
}

export const subscriptions: Subscription[] = schools.map((school, i) => ({
  id: `sub_${i + 1}`,
  schoolId: school.id,
  plan: school.plan,
  price: school.monthlyPrice,
  startDate: school.createdAt,
  endDate: school.subscriptionEnd,
  status: school.status === 'trial' ? 'trial' : school.status,
  seats: school.studentsCount + school.teachersCount,
  autoRenew: school.status !== 'expired',
}))

export const notifications: Notification[] = [
  { id: 'n1', title: 'امتحان رياضيات جديد', body: 'أضاف أ. محمد العزب اختبار «التفاضل والتكامل» — آخر موعد بعد يومين.', time: 'قبل ١٠ دقائق', type: 'exam', read: false, role: 'student' },
  { id: 'n2', title: 'نتيجة الكويز جاهزة', body: 'حصلت على ٧ / ٨ في كويز النهايات. أحسنت! 🎉', time: 'قبل ساعة', type: 'grade', read: false, role: 'student' },
  { id: 'n3', title: 'تقرير الحضور الأسبوعي', body: 'حضر يوسف ٥ أيام من أصل ٥ هذا الأسبوع.', time: 'أمس', type: 'attendance', read: true, role: 'student' },
  { id: 'n4', title: 'ريلز جديد من أ. سارة', body: 'شاهد «ليه القمر مبيقعش علينا؟» في مادة الفيزياء.', time: 'أمس', type: 'reel', read: true, role: 'student' },
  { id: 'n5', title: 'غياب يوسف اليوم', body: 'تم تسجيل غياب يوسف سامي في حصة الرياضيات اليوم.', time: 'قبل ٣٠ دقيقة', type: 'attendance', read: false, role: 'parent' },
  { id: 'n6', title: 'تقرير الأداء الشهري', body: 'تحسن مستوى يوسف بنسبة ٦٪ هذا الشهر. اطّلع على التفاصيل.', time: 'أمس', type: 'grade', read: false, role: 'parent' },
  { id: 'n7', title: 'اجتماع أولياء الأمور', body: 'موعد اجتماع أولياء الأمور يوم السبت القادم الساعة ١٠ صباحًا.', time: 'قبل يومين', type: 'system', read: true, role: 'parent' },
  { id: 'n8', title: '٣ تسليمات جديدة', body: 'سلّم ٣ طلاب اختبار الرياضيات، بانتظار التصحيح.', time: 'قبل ١٠ دقائق', type: 'exam', read: false, role: 'teacher' },
  { id: 'n9', title: 'تنبيه مستوى طالب', body: 'انخفض أداء «زياد فتحي» في مهارة الدوال بنسبة ١٢٪.', time: 'قبل ساعة', type: 'grade', read: false, role: 'teacher' },
  { id: 'n10', title: 'تم نشر الريل بنجاح', body: 'ريل «خدعة النهايات» وصل إلى ١٢٤٠٠ مشاهدة.', time: 'أمس', type: 'reel', read: true, role: 'teacher' },
  { id: 'n11', title: 'طلب إضافة معلم', body: 'قدمت إدارة المدرسة طلبًا لإضافة معلم جديد (مادة العلوم).', time: 'قبل ساعتين', type: 'system', read: false, role: 'manager' },
  { id: 'n12', title: 'اكتمال اشتراك مدرسة', body: 'اشتراك مدرسة المستقبل التجريبي ينتهي خلال ٢٣ يومًا.', time: 'اليوم', type: 'system', read: false, role: 'super_admin' },
  { id: 'n13', title: 'مدرسة جديدة انضمت', body: 'أكاديمية الأمل سجلت على المنصة وتحتاج تفعيل الاشتراك.', time: 'أمس', type: 'system', read: false, role: 'super_admin' },
]

export const announcements: Announcement[] = [
  { id: 'an_1', schoolId: 'sch_1', authorName: 'خالد المنصور', title: 'بدء مراجعات منتصف الفصل', body: 'تبدأ مراجعات منتصف الفصل يوم الأحد القادم. يرجى من الطلاب متابعة جدول المراجعات على المنصة.', date: daysAgo(1), audience: 'الجميع' },
  { id: 'an_2', schoolId: 'sch_1', authorName: 'خالد المنصور', title: 'تحديث جدول الحصص', body: 'تم تحديث جدول الحصص للصف الثاني الثانوي. راجعوا الجدول من صفحة الفصل.', date: daysAgo(4), audience: 'الصف الثاني الثانوي' },
  { id: 'an_3', schoolId: 'sch_1', authorName: 'أ. محمد العزب', title: 'مذكرة مراجعة إضافية', body: 'أضفت مذكرة مراجعة شاملة قبل الاختبار القادم في صفحة المادة.', date: daysAgo(2), audience: '٢ / أ' },
]

export const auditLog: AuditEntry[] = [
  { id: 'au_1', actor: 'خالد المنصور', action: 'أضاف طالبًا جديدًا', target: 'فؤاد رمضان — ١ / أ', time: 'قبل ١٠ دقائق', type: 'create' },
  { id: 'au_2', actor: 'أ. محمد العزب', action: 'أنشأ اختبارًا بالذكاء الاصطناعي', target: 'اختبار التفاضل والتكامل', time: 'قبل ساعة', type: 'create' },
  { id: 'au_3', actor: 'أحمد الشريف', action: 'فعّل اشتراك مدرسة', target: 'مدارس الأندلس — Enterprise', time: 'قبل ٣ ساعات', type: 'update' },
  { id: 'au_4', actor: 'أ. سارة النجار', action: 'نشرت ريلز جديدًا', target: 'ليه القمر مبيقعش علينا؟', time: 'أمس', type: 'create' },
  { id: 'au_5', actor: 'خالد المنصور', action: 'حدّث بيانات معلم', target: 'أ. نور الهدى', time: 'أمس', type: 'update' },
  { id: 'au_6', actor: 'أحمد الشريف', action: 'سجّل دخول', target: 'لوحة تحكم المنصة', time: 'أمس', type: 'login' },
  { id: 'au_7', actor: 'خالد المنصور', action: 'حذف حساب ولي أمر', target: 'حساب غير مكتمل', time: 'قبل يومين', type: 'delete' },
]

export const studentSkills: Record<string, SkillScore[]> = {
  stu_1: [
    { skill: 'النهايات', score: 88 },
    { skill: 'الاشتقاق', score: 76 },
    { skill: 'التكامل', score: 62 },
    { skill: 'تطبيقات المشتقة', score: 58 },
    { skill: 'الهندسة', score: 91 },
  ],
  stu_3: [
    { skill: 'النهايات', score: 72 },
    { skill: 'الاشتقاق', score: 64 },
    { skill: 'التكامل', score: 55 },
    { skill: 'تطبيقات المشتقة', score: 48 },
    { skill: 'الهندسة', score: 80 },
  ],
  stu_5: [
    { skill: 'النهايات', score: 60 },
    { skill: 'الاشتقاق', score: 52 },
    { skill: 'التكامل', score: 44 },
    { skill: 'تطبيقات المشتقة', score: 38 },
    { skill: 'الهندسة', score: 69 },
  ],
}

export const weeklyPerformance = [
  { label: 'الأسبوع ١', value: 72 },
  { label: 'الأسبوع ٢', value: 78 },
  { label: 'الأسبوع ٣', value: 74 },
  { label: 'الأسبوع ٤', value: 83 },
  { label: 'الأسبوع ٥', value: 86 },
  { label: 'الأسبوع ٦', value: 88 },
]

export const monthlyRevenue = [
  { label: 'مايو', value: 52000 },
  { label: 'يونيو', value: 58000 },
  { label: 'يوليو', value: 54000 },
  { label: 'أغسطس', value: 63000 },
  { label: 'سبتمبر', value: 71000 },
  { label: 'أكتوبر', value: 78000 },
]

export const subjectPerformance = [
  { label: 'رياضيات', value: 88 },
  { label: 'فيزياء', value: 74 },
  { label: 'كيمياء', value: 81 },
  { label: 'أحياء', value: 69 },
  { label: 'عربي', value: 92 },
  { label: 'إنجليزي', value: 85 },
]

export { daysAgo, daysAhead }
