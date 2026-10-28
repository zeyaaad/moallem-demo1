import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Brain, Check, CheckCircle2, FileText, Loader2,
  Plus, RefreshCw, Sparkles, Trash2, Upload, Wand2, X,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Difficulty, Question, QuestionType, Teacher } from '../../types'
import { Badge, Button, Card, Field, PageHeader, useToast } from '../../components/ui'
import { generateQuestions } from '../../lib/ai'
import { cn } from '../../lib/utils'

const steps = ['المحتوى والإعدادات', 'مراجعة الأسئلة', 'النشر']

export default function ExamBuilderPage() {
  const { currentUser, db, addExam, notify } = useStore()
  const me = currentUser as Teacher
  const navigate = useNavigate()
  const { push } = useToast()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'ai' | 'manual'>(params.get('mode') === 'manual' ? 'manual' : 'ai')
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState(me?.subjectIds?.[0] ?? db.subjects[0]?.id ?? '')
  const [classId, setClassId] = useState(me?.classIds?.[0] ?? db.classes[0]?.id ?? '')
  const [durationMin, setDurationMin] = useState(30)
  const [count, setCount] = useState(6)
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed')
  const [types, setTypes] = useState<QuestionType[]>(['mcq', 'truefalse'])
  const [filename, setFilename] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [genStep, setGenStep] = useState(0)
  const timers = useRef<number[]>([])

  const teacherClasses = db.classes.filter((c) => me?.classIds.includes(c.id))
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0)

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  const generate = () => {
    if (!filename) { push({ title: 'ارفع المادة العلمية أولًا', body: 'اضغط «استخدم ملفًا تجريبيًا» لتجربة سريعة.', tone: 'error' }); return }
    setGenerating(true)
    setProgress(0)
    setGenStep(0)
    const subjectName = db.subjects.find((s) => s.id === subjectId)?.name ?? 'الرياضيات'
    const stepTimer = setInterval(() => {
      setProgress((p) => Math.min(92, p + 4))
      setGenStep((s) => Math.min(3, s + 1))
    }, 320)
    timers.current.push(stepTimer as unknown as number)
    timers.current.push(window.setTimeout(() => {
      clearInterval(stepTimer)
      setQuestions(generateQuestions(subjectName, count, difficulty, types))
      setProgress(100)
      setGenerating(false)
      setStep(1)
      if (!title) setTitle(`اختبار ${subjectName} — ${new Date().toLocaleDateString('ar-EG', { month: 'long' })}`)
      push({ title: `تم توليد ${count} أسئلة بنجاح ✨`, body: 'راجع الأسئلة وعدّل ما تريد قبل النشر.', tone: 'success' })
    }, 3800))
  }

  const publish = () => {
    if (!title.trim()) { push({ title: 'اكتب عنوان الامتحان', tone: 'error' }); return }
    if (questions.length === 0) { push({ title: 'أضف سؤالًا واحدًا على الأقل', tone: 'error' }); return }
    const exam = addExam({
      title, description: description || 'امتحان تم إنشاؤه من المنصة.', subjectId, classId,
      durationMin, questions, source: mode === 'ai' ? 'ai' : 'manual',
      materials: filename ? [filename] : undefined,
    })
    notify('تم إنشاء امتحان جديد', title)
    push({ title: 'تم نشر الامتحان بنجاح 🎉', body: 'أصبح متاحًا لطلاب الفصل الآن.', tone: 'success' })
    navigate(`/app/exams/${exam.id}`)
  }

  if (currentUser?.role !== 'teacher') {
    return <Card className="p-10 text-center text-sm text-slate-500">هذه الصفحة مخصصة للمعلمين فقط.</Card>
  }

  return (
    <div>
      <Link to="/app/exams" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowRight className="size-3.5" /> العودة للامتحانات</Link>
      <PageHeader
        title="إنشاء امتحان جديد"
        subtitle="أنشئ امتحانًا يدويًا أو دع الذكاء الاصطناعي يبنيه من مادتك العلمية في ثوانٍ."
        actions={<Badge tone={mode === 'ai' ? 'violet' : 'brand'}>{mode === 'ai' ? <><Sparkles className="size-3" /> مدعوم بالذكاء الاصطناعي</> : 'إنشاء يدوي'}</Badge>}
      />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-3">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold', i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500')}>
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn('hidden text-[11px] font-bold sm:block', i === step ? 'text-slate-900' : 'text-slate-400')}>{s}</span>
            {i < steps.length - 1 && <span className={cn('h-px flex-1', i < step ? 'bg-emerald-300' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      {generating ? (
        <Card className="relative overflow-hidden p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-teal-50/40" />
          <div className="relative mx-auto max-w-lg">
            <div className="relative mx-auto flex size-20 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-2xl shadow-violet-600/30">
              <Brain className="size-9" />
              <span className="absolute inset-0 animate-ping rounded-3xl bg-violet-500/20" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-950">جارٍ تحليل المادة وتوليد الأسئلة…</h2>
            <p className="mt-1.5 text-xs text-slate-500">يقرأ المساعد الذكي الملف ويستخرج المفاهيم الأساسية.</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-l from-violet-500 to-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-bold text-violet-600">{progress}%</p>
            <div className="mt-6 space-y-2 text-start">
              {['قراءة الملف واستخراج النص', 'تحليل المفاهيم والمهارات', 'صياغة الأسئلة والإجابات', 'توزيع الدرجات والصعوبة'].map((label, i) => (
                <div key={label} className={cn('flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]', i <= genStep ? 'bg-white font-bold text-slate-800 shadow-sm' : 'text-slate-400')}>
                  {i < genStep ? <CheckCircle2 className="size-4 text-emerald-500" /> : i === genStep ? <Loader2 className="size-4 animate-spin text-violet-500" /> : <span className="size-4 rounded-full border border-slate-200" />}
                  {label}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : step === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          {/* Upload / content */}
          <div className="space-y-4">
            {step === 0 && questions.length === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'ai' as const, title: 'بالذكاء الاصطناعي', desc: 'ارفع المذكرة ودع المنصة تولّد الأسئلة', icon: Brain, tone: 'violet' },
                  { key: 'manual' as const, title: 'إنشاء يدوي', desc: 'اكتب الأسئلة بنفسك خطوة بخطوة', icon: FileText, tone: 'brand' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMode(m.key)}
                    className={cn('rounded-2xl border-2 p-4 text-start transition', mode === m.key ? (m.key === 'ai' ? 'border-violet-500 bg-violet-50/50' : 'border-brand-500 bg-brand-50/50') : 'border-slate-200 bg-white hover:border-slate-300')}
                  >
                    <span className={cn('flex size-9 items-center justify-center rounded-xl', m.key === 'ai' ? 'bg-violet-100 text-violet-600' : 'bg-brand-100 text-brand-600')}><m.icon className="size-4.5" /></span>
                    <p className="mt-2 text-xs font-extrabold text-slate-900">{m.title}</p>
                    <p className="mt-0.5 text-[10px] leading-5 text-slate-500">{m.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {mode === 'ai' ? (
              <Card className="p-5">
                <h2 className="text-sm font-extrabold text-slate-900">المادة العلمية</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">PDF أو Word أو صورة — حتى ٢٠ ميجابايت.</p>
                <label className="mt-4 block cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) { setFilename(f.name); push({ title: 'تم رفع الملف', body: f.name, tone: 'success' }) }
                    }}
                  />
                  {filename ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm"><FileText className="size-5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-slate-800">{filename}</p>
                        <p className="text-[10px] text-slate-400">جاهز للتحليل • تم الرفع الآن</p>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); setFilename('') }} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-500"><X className="size-4" /></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 py-10 transition hover:border-violet-300 hover:bg-violet-50/30">
                      <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm"><Upload className="size-5" /></span>
                      <p className="text-xs font-bold text-slate-700">اسحب الملف هنا أو اضغط للاختيار</p>
                      <p className="mt-1 text-[10px] text-slate-400">PDF, DOCX, TXT, JPG, PNG</p>
                    </div>
                  )}
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setFilename('مذكرة_التفاضل_الفصل_الثالث.pdf')}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-violet-700 hover:bg-violet-100"
                  >
                    <Sparkles className="size-3" /> استخدم ملفًا تجريبيًا
                  </button>
                  <span className="text-[10px] text-slate-400">أو اكتب عنوان الدرس بالأسفل</span>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><Wand2 className="size-3.5 text-violet-500" /> كيف يعمل؟</p>
                  <ol className="mt-2 space-y-1.5 text-[10px] leading-5 text-slate-500">
                    <li>١. يقرأ المساعد المحتوى ويستخرج المفاهيم والمهارات.</li>
                    <li>٢. يولّد أسئلة متنوعة حسب الإعدادات التي تختارها.</li>
                    <li>٣. تراجع الأسئلة وتعدّل الإجابات قبل النشر.</li>
                  </ol>
                </div>
              </Card>
            ) : (
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-brand-600" />
                  <h2 className="text-sm font-extrabold text-slate-900">أسئلة الامتحان</h2>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">أضف أسئلة اختيار من متعدد أو صح/خطأ.</p>
                <ManualQuestions questions={questions} setQuestions={setQuestions} />
              </Card>
            )}
          </div>

          {/* Settings */}
          <Card className="h-fit p-5">
            <h2 className="text-sm font-extrabold text-slate-900">بيانات الامتحان</h2>
            <div className="mt-4 space-y-4">
              <Field label="عنوان الامتحان">
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: اختبار التفاضل والتكامل" />
              </Field>
              <Field label="وصف مختصر">
                <textarea className="textarea min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ماذا يغطي هذا الامتحان؟" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="المادة">
                  <select className="select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    {db.subjects.slice(0, 8).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="الفصل">
                  <select className="select" value={classId} onChange={(e) => setClassId(e.target.value)}>
                    {teacherClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    {teacherClasses.length === 0 && db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="المدة (دقيقة)">
                  <input type="number" min={5} max={120} className="input" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
                </Field>
                <Field label="عدد الأسئلة">
                  <select className="select" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                    {[3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n} أسئلة</option>)}
                  </select>
                </Field>
              </div>

              {mode === 'ai' && (
                <>
                  <div>
                    <p className="label">مستوى الصعوبة</p>
                    <div className="flex gap-1.5">
                      {([['mixed', 'متنوع'], ['easy', 'سهل'], ['medium', 'متوسط'], ['hard', 'صعب']] as const).map(([v, l]) => (
                        <button key={v} onClick={() => setDifficulty(v)} className={cn('flex-1 rounded-lg border px-2 py-2 text-[10px] font-bold transition', difficulty === v ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50')}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="label">أنواع الأسئلة</p>
                    <div className="flex gap-2">
                      {([['mcq', 'اختيار من متعدد'], ['truefalse', 'صح / خطأ']] as const).map(([v, l]) => (
                        <label key={v} className={cn('flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-[10px] font-bold transition', types.includes(v) ? 'border-violet-300 bg-violet-50/50 text-violet-700' : 'border-slate-200 text-slate-500')}>
                          <input
                            type="checkbox"
                            checked={types.includes(v)}
                            onChange={() => setTypes((prev) => prev.includes(v) ? (prev.length > 1 ? prev.filter((t) => t !== v) : prev) : [...prev, v])}
                            className="size-3.5 accent-violet-600"
                          />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mode === 'ai' ? (
                <Button className="w-full bg-violet-600 shadow-violet-600/20 hover:bg-violet-700" size="lg" onClick={generate}>
                  <Sparkles className="size-4" /> توليد الأسئلة بالذكاء الاصطناعي
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={() => { if (questions.length === 0) { push({ title: 'أضف سؤالًا أولًا', tone: 'error' }); return } setStep(1); if (!title) setTitle(`اختبار ${db.subjects.find((s) => s.id === subjectId)?.name} — جديد`) }}>
                  متابعة للمراجعة <ArrowLeft className="size-4" />
                </Button>
              )}
              <p className="text-center text-[9px] leading-4 text-slate-400">يمكنك تعديل كل سؤال ودرجته بعد التوليد قبل النشر.</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={mode === 'ai' ? 'violet' : 'brand'}>{mode === 'ai' ? <><Sparkles className="size-2.5" /> مولّد بالذكاء الاصطناعي</> : 'إنشاء يدوي'}</Badge>
                    <Badge tone="slate">{questions.length} أسئلة</Badge>
                    <Badge tone="emerald">{totalMarks} درجة</Badge>
                  </div>
                  <h2 className="mt-2 text-base font-black text-slate-900">{title || 'امتحان بدون عنوان'}</h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">{db.subjects.find((s) => s.id === subjectId)?.name} • فصل {db.classes.find((c) => c.id === classId)?.name} • {durationMin} دقيقة</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setStep(0)}><RefreshCw className="size-3.5" /> تعديل البيانات</Button>
              </div>
            </Card>

            {questions.map((q, i) => (
              <Card key={q.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-extrabold text-brand-700">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={q.difficulty === 'easy' ? 'emerald' : q.difficulty === 'medium' ? 'amber' : 'rose'}>
                        {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                      </Badge>
                      <Badge tone="slate">{q.type === 'mcq' ? 'اختيار من متعدد' : 'صح/خطأ'}</Badge>
                      <span className="text-[10px] text-slate-400">{q.skill} • {q.marks} درجة</span>
                      <button onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))} className="ms-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-3.5" /></button>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-7 text-slate-800">{q.text}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setQuestions((prev) => prev.map((x) => x.id === q.id ? { ...x, correctIndex: oi } : x))}
                          className={cn('flex items-center gap-2 rounded-lg border px-2.5 py-2 text-start text-[11px] transition', oi === q.correctIndex ? 'border-emerald-300 bg-emerald-50 font-bold text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
                        >
                          <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border text-[8px]', oi === q.correctIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300')}>
                            {oi === q.correctIndex && <Check className="size-2.5" />}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[9px] text-slate-400">اضغط على الخيار الصحيح لتغييره.</p>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setQuestions((prev) => [...prev, {
                id: `manual_${Date.now()}`, text: 'سؤال جديد — اكتب نص السؤال هنا',
                type: 'mcq', options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
                correctIndex: 0, marks: 2, difficulty: 'medium', skill: 'عام',
              }])}><Plus className="size-4" /> إضافة سؤال</Button>
              {mode === 'ai' && <Button variant="soft" onClick={generate}><RefreshCw className="size-4" /> إعادة التوليد</Button>}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="sticky top-20 p-5">
              <h3 className="text-sm font-extrabold text-slate-900">ملخص الامتحان</h3>
              <div className="mt-4 space-y-3 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400">عدد الأسئلة</span><span className="font-extrabold text-slate-800">{questions.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">إجمالي الدرجات</span><span className="font-extrabold text-slate-800">{totalMarks}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">المدة</span><span className="font-extrabold text-slate-800">{durationMin} دقيقة</span></div>
                <div className="flex justify-between"><span className="text-slate-400">الفصل</span><span className="font-extrabold text-slate-800">{db.classes.find((c) => c.id === classId)?.name}</span></div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="mb-2 text-slate-400">توزيع الصعوبة</p>
                  {(['easy', 'medium', 'hard'] as const).map((d) => {
                    const n = questions.filter((q) => q.difficulty === d).length
                    return (
                      <div key={d} className="mb-2">
                        <div className="mb-1 flex justify-between"><span className="text-slate-500">{d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'صعب'}</span><span className="font-bold text-slate-700">{n}</span></div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn('h-full rounded-full', d === 'easy' ? 'bg-emerald-400' : d === 'medium' ? 'bg-amber-400' : 'bg-rose-400')} style={{ width: `${questions.length ? (n / questions.length) * 100 : 0}%` }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <Button className="mt-4 w-full" size="lg" onClick={publish}><CheckCircle2 className="size-4" /> نشر الامتحان</Button>
              <p className="mt-2 text-center text-[9px] text-slate-400">سيظهر الامتحان لطلاب الفصل فورًا.</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function ManualQuestions({ questions, setQuestions }: { questions: Question[]; setQuestions: React.Dispatch<React.SetStateAction<Question[]>> }) {
  const [text, setText] = useState('')
  const [type, setType] = useState<QuestionType>('mcq')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correct, setCorrect] = useState(0)
  const [marks, setMarks] = useState(2)
  const { push } = useToast()

  const add = () => {
    if (!text.trim()) { push({ title: 'اكتب نص السؤال', tone: 'error' }); return }
    const opts = type === 'truefalse' ? ['صحيح', 'خطأ'] : options.map((o, i) => o.trim() || `الخيار ${i + 1}`)
    setQuestions((prev) => [...prev, {
      id: `manual_${Date.now()}`, text, type, options: opts,
      correctIndex: type === 'truefalse' ? correct : correct, marks, difficulty: 'medium', skill: 'عام',
    }])
    setText('')
    setOptions(['', '', '', ''])
    setCorrect(0)
    push({ title: 'تمت إضافة السؤال', tone: 'success' })
  }

  return (
    <div className="mt-4 space-y-3">
      {questions.map((q, i) => (
        <div key={q.id} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white text-[9px] font-bold text-slate-500">{i + 1}</span>
          <p className="flex-1 text-[11px] font-semibold leading-5 text-slate-700">{q.text}</p>
          <span className="text-[9px] text-slate-400">{q.marks} د</span>
          <button onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))} className="text-slate-400 hover:text-rose-500"><Trash2 className="size-3.5" /></button>
        </div>
      ))}

      <div className="rounded-xl border border-slate-200 p-3">
        <Field label="نص السؤال">
          <textarea className="textarea min-h-16 text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب السؤال هنا…" />
        </Field>
        <div className="mt-2 flex gap-1.5">
          {([['mcq', 'اختيار من متعدد'], ['truefalse', 'صح / خطأ']] as const).map(([v, l]) => (
            <button key={v} onClick={() => { setType(v); setCorrect(0) }} className={cn('rounded-lg border px-2.5 py-1.5 text-[10px] font-bold', type === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500')}>{l}</button>
          ))}
        </div>
        {type === 'mcq' ? (
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <button onClick={() => setCorrect(i)} className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border text-[8px]', correct === i ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300')}>{correct === i && <Check className="size-2.5" />}</button>
                <input className="input h-8 px-2 text-[11px]" value={o} onChange={(e) => setOptions((prev) => prev.map((x, xi) => xi === i ? e.target.value : x))} placeholder={`الخيار ${i + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex gap-1.5">
            {['صحيح', 'خطأ'].map((o, i) => (
              <button key={o} onClick={() => setCorrect(i)} className={cn('rounded-lg border px-3 py-1.5 text-[10px] font-bold', correct === i ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500')}>{o}</button>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-500">الدرجة</label>
          <input type="number" min={1} max={10} value={marks} onChange={(e) => setMarks(Number(e.target.value))} className="input h-8 w-16 px-2 text-[11px]" />
          <Button size="sm" className="ms-auto h-8" onClick={add}><Plus className="size-3" /> إضافة</Button>
        </div>
      </div>
      <p className="text-[10px] text-slate-400">لديك {questions.length} سؤالًا — يمكنك المتابعة للمراجعة في أي وقت.</p>
    </div>
  )
}
