import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Brain, CalendarDays, CheckCircle2, ChevronDown, Clock, FileQuestion,
  Play, Sparkles, Target, TrendingUp, Trophy, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Parent, Student } from '../../types'
import { Avatar, Badge, Button, Card, ProgressBar, StatCard, useToast } from '../../components/ui'
import SubjectIcon from '../../components/SubjectIcon'
import { BarChart, Doughnut } from '../../components/charts'
import { cn, relativeDay } from '../../lib/utils'

export default function ExamDetailPage() {
  const { id } = useParams()
  const { currentUser, db, getSubject, getClass, getTeacher, publishExam } = useStore()
  const exam = db.exams.find((e) => e.id === id)
  const { push } = useToast()
  const navigate = useNavigate()
  const [openQ, setOpenQ] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (!exam) {
    return <Card><div className="p-10 text-center text-sm text-slate-500">الامتحان غير موجود. <Link to="/app/exams" className="font-bold text-brand-600">العودة</Link></div></Card>
  }

  const subject = getSubject(exam.subjectId)
  const cls = getClass(exam.classId)
  const teacher = getTeacher(exam.teacherId)
  const attempts = db.attempts.filter((a) => a.examId === exam.id)

  if (currentUser?.role === 'student') {
    const me = currentUser as Student
    const mine = attempts.filter((a) => a.studentId === me.id)
    const best = mine.length ? Math.max(...mine.map((a) => a.score)) : null
    return (
      <div className="mx-auto max-w-4xl">
        <Link to="/app/exams" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowRight className="size-3.5" /> العودة للامتحانات</Link>

        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
            <div className="absolute inset-0 bg-gradient-to-l from-brand-700/80 to-slate-950" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <SubjectIcon subject={subject} className="size-14 bg-white/10" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="slate" className="border-white/10 bg-white/10 text-white">{subject?.name}</Badge>
                    {exam.source === 'ai' && <Badge tone="violet"><Sparkles className="size-2.5" /> مولّد بالذكاء الاصطناعي</Badge>}
                  </div>
                  <h1 className="mt-2 text-xl font-black">{exam.title}</h1>
                  <p className="mt-1 text-xs text-white/60">{teacher?.name} • فصل {cls?.name}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-white/50">آخر موعد</p>
                <p className="mt-1 text-sm font-extrabold text-amber-300">{relativeDay(exam.dueDate)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 border-b border-slate-100 sm:grid-cols-4">
            {[
              { label: 'عدد الأسئلة', value: `${exam.questions.length}`, icon: FileQuestion },
              { label: 'المدة', value: `${exam.durationMin} دقيقة`, icon: Clock },
              { label: 'الدرجة الكلية', value: `${exam.totalMarks}`, icon: Trophy },
              { label: 'محاولاتك', value: `${mine.length}`, icon: Target },
            ].map((s) => (
              <div key={s.label} className="p-4 text-center">
                <s.icon className="mx-auto mb-1.5 size-4 text-slate-400" />
                <p className="text-sm font-extrabold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="p-6">
            <p className="text-sm leading-7 text-slate-600">{exam.description}</p>

            {best !== null && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle2 className="size-5" /></span>
                  <div>
                    <p className="text-xs font-extrabold text-emerald-800">لقد حللت هذا الامتحان</p>
                    <p className="text-[10px] text-emerald-600">أفضل نتيجة: {best} من {exam.totalMarks} — يمكنك إعادة المحاولة للتحسين.</p>
                  </div>
                </div>
                <Badge tone="emerald">{Math.round((best / exam.totalMarks) * 100)}%</Badge>
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-slate-800"><Brain className="size-4 text-brand-600" /> قبل أن تبدأ</p>
              <ul className="space-y-1.5 text-[11px] leading-6 text-slate-500">
                <li className="flex gap-2"><span className="text-brand-500">•</span> اقرأ كل سؤال بتركيز قبل اختيار الإجابة.</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> يمكنك التنقل بين الأسئلة وتعديل إجاباتك قبل التسليم.</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> عند انتهاء الوقت سيتم تسليم الامتحان تلقائيًا.</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> تأكد من اتصالك بالإنترنت قبل البدء.</li>
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="lg" className="flex-1 sm:flex-none" onClick={() => { if (exam.questions.length === 0) { push({ title: 'الامتحان لا يحتوي أسئلة بعد', tone: 'error' }); return } navigate(`/exam/${exam.id}`) }}>
                <Play className="size-4 fill-current" /> ابدأ الامتحان الآن
              </Button>
              <Link to="/app/exams"><Button size="lg" variant="secondary">العودة</Button></Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (currentUser?.role === 'parent') {
    const me = currentUser as Parent
    const children = db.students.filter((s) => me.studentIds.includes(s.id) && s.classId === exam.classId)
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/app/exams" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500"><ArrowRight className="size-3.5" /> العودة</Link>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <SubjectIcon subject={subject} className="size-12" />
            <div>
              <h1 className="text-lg font-black text-slate-900">{exam.title}</h1>
              <p className="mt-1 text-xs text-slate-500">{subject?.name} • {teacher?.name} • {exam.durationMin} دقيقة</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {children.map((child) => {
              const attempt = attempts.find((a) => a.studentId === child.id)
              return (
                <div key={child.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <Avatar name={child.name} color={child.avatarColor} size="sm" />
                  <p className="flex-1 text-xs font-bold text-slate-800">{child.name}</p>
                  {attempt ? <Badge tone="emerald">{attempt.score} / {exam.totalMarks}</Badge> : <Badge tone="amber">لم يُحل بعد</Badge>}
                </div>
              )
            })}
            {children.length === 0 && <p className="text-xs text-slate-400">لا يوجد أبناء في هذا الفصل.</p>}
          </div>
        </Card>
      </div>
    )
  }

  /* Teacher view */
  const scores = attempts.map((a) => Math.round((a.score / a.total) * 100))
  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0
  const passRate = scores.length ? Math.round((scores.filter((s) => s >= 60).length / scores.length) * 100) : 0
  const distribution = [
    { label: '0-20', value: scores.filter((s) => s < 20).length },
    { label: '20-40', value: scores.filter((s) => s >= 20 && s < 40).length },
    { label: '40-60', value: scores.filter((s) => s >= 40 && s < 60).length },
    { label: '60-80', value: scores.filter((s) => s >= 60 && s < 80).length },
    { label: '80-100', value: scores.filter((s) => s >= 80).length },
  ]

  return (
    <div>
      <Link to="/app/exams" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowRight className="size-3.5" /> العودة للامتحانات</Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <SubjectIcon subject={subject} className="size-12" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-slate-950">{exam.title}</h1>
              {exam.source === 'ai' && <Badge tone="violet"><Sparkles className="size-2.5" /> AI</Badge>}
              <Badge tone={exam.status === 'published' ? 'emerald' : exam.status === 'draft' ? 'amber' : 'slate'} dot>
                {exam.status === 'published' ? 'منشور' : exam.status === 'draft' ? 'مسودة' : 'مغلق'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">{subject?.name} • فصل {cls?.name} • {exam.questions.length} أسئلة • {exam.durationMin} دقيقة • {exam.totalMarks} درجة</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {exam.status === 'draft' && <Button onClick={() => { publishExam(exam.id); push({ title: 'تم نشر الامتحان بنجاح', tone: 'success' }) }}>نشر الامتحان</Button>}
          <Link to={`/app/exams/${exam.id}/preview`} onClick={(e) => e.preventDefault()}><Button variant="secondary"><FileQuestion className="size-4" /> معاينة كطالب</Button></Link>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="التسليمات" value={attempts.length} icon={Users} tone="brand" />
        <StatCard label="متوسط الدرجات" value={`${avg}%`} icon={TrendingUp} tone="emerald" delta="+٥٪" hint="مقارنة سابق" />
        <StatCard label="نسبة النجاح" value={`${passRate}%`} icon={CheckCircle2} tone="sky" />
        <StatCard label="أعلى درجة" value={`${Math.max(0, ...scores)}%`} icon={Trophy} tone="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">توزيع الدرجات</h2>
            <Badge tone="slate">{attempts.length} طالب</Badge>
          </div>
          <BarChart data={distribution} height={190} color="#6366f1" suffix="" />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">ملخص سريع</h2>
          <div className="mt-4">
            <Doughnut
              segments={[
                { label: 'ناجح', value: scores.filter((s) => s >= 60).length, color: '#10b981' },
                { label: 'راسب', value: scores.filter((s) => s < 60).length, color: '#f43f5e' },
              ]}
              centerValue={`${passRate}%`}
              centerLabel="نجاح"
              size={140}
            />
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px]">
            <div className="flex justify-between"><span className="text-slate-400">أصعب سؤال</span><span className="font-bold text-slate-700">سؤال التكامل</span></div>
            <div className="flex justify-between"><span className="text-slate-400">متوسط الوقت</span><span className="font-bold text-slate-700">٢٢ دقيقة</span></div>
            <div className="flex justify-between"><span className="text-slate-400">المادة</span><span className="font-bold text-slate-700">{subject?.name}</span></div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">نتائج الطلاب</h2>
            <span className="text-[10px] text-slate-400">مرتبة حسب الدرجة</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {[...attempts].sort((a, b) => b.score - a.score).map((a) => {
              const student = db.students.find((s) => s.id === a.studentId)
              const pct = Math.round((a.score / a.total) * 100)
              return (
                <div key={a.id} className="flex items-center gap-3 border-b border-slate-50 px-5 py-2.5 last:border-0">
                  <Avatar name={student?.name ?? ''} color={student?.avatarColor} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{student?.name}</p>
                    <p className="text-[9px] text-slate-400">{relativeDay(a.submittedAt)} • {a.timeSpentMin} د</p>
                  </div>
                  <div className="w-20"><ProgressBar value={pct} size="sm" tone={pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose'} /></div>
                  <span className="w-12 text-end text-xs font-extrabold text-slate-700">{a.score}/{a.total}</span>
                </div>
              )
            })}
            {attempts.length === 0 && <p className="px-5 py-8 text-center text-xs text-slate-400">لا توجد تسليمات بعد.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">أسئلة الامتحان</h2>
            <button onClick={() => setShowAll((v) => !v)} className="text-[10px] font-bold text-brand-600">{showAll ? 'إخفاء الإجابات' : 'إظهار الإجابات'}</button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {exam.questions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-slate-100">
                <button onClick={() => setOpenQ(openQ === q.id ? null : q.id)} className="flex w-full items-start gap-2 p-3 text-start">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[9px] font-bold text-slate-500">{i + 1}</span>
                  <span className="flex-1 text-[11px] font-semibold leading-5 text-slate-700">{q.text}</span>
                  <ChevronDown className={cn('mt-0.5 size-3.5 shrink-0 text-slate-400 transition', openQ === q.id && 'rotate-180')} />
                </button>
                {(openQ === q.id || showAll) && (
                  <div className="border-t border-slate-50 px-3 pb-3 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((opt, oi) => (
                        <span key={oi} className={cn('rounded-lg px-2 py-1 text-[10px]', oi === q.correctIndex ? 'bg-emerald-50 font-bold text-emerald-700' : 'bg-slate-50 text-slate-500')}>
                          {oi === q.correctIndex && '✓ '}{opt}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-400">
                      <Badge tone={q.difficulty === 'easy' ? 'emerald' : q.difficulty === 'medium' ? 'amber' : 'rose'}>
                        {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                      </Badge>
                      <span>{q.skill}</span>
                      <span>• {q.marks} درجة</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {exam.questions.length === 0 && <p className="py-8 text-center text-xs text-slate-400">لم تُضف أسئلة بعد.</p>}
          </div>
        </Card>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] text-slate-500">
        <CalendarDays className="size-4 text-amber-500" /> آخر موعد للامتحان: <b>{relativeDay(exam.dueDate)}</b>
        <span className="mx-2 text-slate-200">|</span>
        <BarChart3 className="size-4 text-brand-500" /> تم إنشاؤه {relativeDay(exam.createdAt)}
        <span className="mx-2 text-slate-200">|</span>
        <Brain className="size-4 text-violet-500" /> {exam.source === 'ai' ? 'باستخدام الذكاء الاصطناعي' : 'إنشاء يدوي'}
      </div>
    </div>
  )
}
