import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, Download, Eye, FileQuestion, GraduationCap, Target, TrendingDown, TrendingUp, Trophy, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Parent, Student } from '../../types'
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, ProgressBar, StatCard } from '../../components/ui'
import { AreaChart, BarChart, RadarChart } from '../../components/charts'
import { studentSkills, subjectPerformance, weeklyPerformance } from '../../data/content'
import { cn, gradeLabel, relativeDay } from '../../lib/utils'

export default function ResultsPage() {
  const { currentUser } = useStore()
  if (currentUser?.role === 'teacher') return <TeacherResults />
  if (currentUser?.role === 'manager') return <TeacherResults schoolWide />
  if (currentUser?.role === 'parent') return <ParentResults />
  return <StudentResults student={currentUser as Student} />
}

/* ------------------------------------------------------------------ */
/* Teacher                                                             */
/* ------------------------------------------------------------------ */

function TeacherResults({ schoolWide = false }: { schoolWide?: boolean }) {
  const { currentUser, db, getClass, getSubject } = useStore()
  const [classFilter, setClassFilter] = useState('all')
  const myClasses = schoolWide
    ? db.classes.filter((c) => c.schoolId === currentUser?.schoolId)
    : db.classes.filter((c) => db.teachers.find((t) => t.id === currentUser?.id)?.classIds.includes(c.id))
  const myExams = schoolWide
    ? db.exams.filter((e) => e.schoolId === currentUser?.schoolId)
    : db.exams.filter((e) => e.teacherId === currentUser?.id)
  const students = db.students.filter((s) => myClasses.some((c) => c.id === s.classId) && (classFilter === 'all' || s.classId === classFilter))
  const attempts = db.attempts.filter((a) => myExams.some((e) => e.id === a.examId))
  const avg = Math.round(students.reduce((s, x) => s + x.average, 0) / Math.max(1, students.length))
  const atRisk = students.filter((s) => s.average < 65)
  const examsWithAttempts = myExams.filter((e) => e.attempts > 0)

  const skillAverages = useMemo(() => {
    const base = studentSkills.stu_1.map((s) => s.skill)
    return base.map((skill) => {
      const values = students.map((st) => (studentSkills[st.id] ?? studentSkills.stu_1).find((x) => x.skill === skill)?.score ?? 70)
      return { skill, score: Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)) }
    })
  }, [students])

  return (
    <div>
      <PageHeader
        title="النتائج والتحليلات"
        subtitle="حلّل أداء طلابك، اكتشف نقاط الضعف، واتخذ قرارًا مبنيًا على البيانات."
        actions={
          <>
            <select className="select h-9.5 w-40 text-xs" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="all">كل الفصول</option>
              {myClasses.map((c) => <option key={c.id} value={c.id}>فصل {c.name}</option>)}
            </select>
            <Button variant="secondary"><Download className="size-4" /> تصدير</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="متوسط الأداء" value={`${avg}%`} icon={TrendingUp} tone="emerald" delta="+٥٪" hint="هذا الشهر" />
        <StatCard label="طلاب متميزون" value={students.filter((s) => s.average >= 85).length} icon={Trophy} tone="amber" hint="أعلى من ٨٥٪" />
        <StatCard label="يحتاجون دعمًا" value={atRisk.length} icon={TrendingDown} tone="rose" hint="أقل من ٦٥٪" />
        <StatCard label="تسليمات مصححة" value={attempts.length} icon={FileQuestion} tone="brand" hint={`${myExams.length} امتحان`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">متوسط الدرجات لكل امتحان</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">مقارنة سريعة بين امتحاناتك</p>
            </div>
            <Badge tone="brand">{examsWithAttempts.length} امتحان</Badge>
          </div>
          <BarChart
            data={examsWithAttempts.map((e) => ({ label: e.title.replace('اختبار ', '').replace('كويز ', '').slice(0, 12), value: e.averageScore }))}
            height={210}
            color="#0ea5e9"
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">مهارات الفصل</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">متوسط إتقان المهارات</p>
          <RadarChart data={skillAverages} size={250} />
          <div className="mt-2 space-y-1.5">
            {skillAverages.slice(0, 3).map((s) => (
              <div key={s.skill} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{s.skill}</span>
                <span className={cn('font-bold', s.score >= 75 ? 'text-emerald-600' : 'text-amber-600')}>{s.score}٪</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">أداء الطلاب</h2>
              <p className="text-[10px] text-slate-400">{students.length} طالبًا</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="size-2 rounded-full bg-rose-500" /> يحتاج دعمًا</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-2.5">الطالب</th>
                  <th className="px-3 py-2.5">الفصل</th>
                  <th className="px-3 py-2.5">المتوسط</th>
                  <th className="px-3 py-2.5">الامتحانات</th>
                  <th className="px-3 py-2.5">الحضور</th>
                  <th className="px-5 py-2.5">الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const count = attempts.filter((a) => a.studentId === s.id).length
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="table-cell">
                        <Link to={`/app/students/${s.id}`} className="flex items-center gap-2.5">
                          <Avatar name={s.name} color={s.avatarColor} size="xs" />
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{s.name}</p>
                            <p className="text-[9px] text-slate-400">{s.code}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="table-cell text-[11px] text-slate-500">{getClass(s.classId)?.name}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-[11px] font-extrabold text-slate-700">{s.average}٪</span>
                          <ProgressBar value={s.average} size="sm" className="w-14" tone={s.average >= 80 ? 'emerald' : s.average >= 65 ? 'amber' : 'rose'} />
                        </div>
                      </td>
                      <td className="table-cell text-[11px] text-slate-500">{count}</td>
                      <td className="table-cell text-[11px] text-slate-500">{s.attendanceRate}٪</td>
                      <td className="table-cell">
                        <Badge tone={s.average >= 85 ? 'emerald' : s.average >= 65 ? 'brand' : 'rose'} dot>
                          {s.average >= 85 ? 'متميز' : s.average >= 65 ? 'منتظم' : 'يحتاج دعمًا'}
                        </Badge>
                      </td>
                      <td className="table-cell"><Link to={`/app/students/${s.id}`}><Eye className="size-4 text-slate-400 hover:text-brand-600" /></Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="size-4 text-rose-500" />
              <h2 className="text-sm font-extrabold text-slate-900">نقاط ضعف تحتاج تدخلًا</h2>
            </div>
            <div className="space-y-3">
              {atRisk.slice(0, 4).map((s) => {
                const skills = studentSkills[s.id] ?? studentSkills.stu_1
                const weak = [...skills].sort((a, b) => a.score - b.score)[0]
                return (
                  <div key={s.id} className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} color={s.avatarColor} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-slate-800">{s.name}</p>
                        <p className="text-[9px] text-slate-400">{weak.skill} — {weak.score}٪</p>
                      </div>
                      <Link to={`/app/students/${s.id}`} className="rounded-lg bg-white p-1.5 text-rose-500 shadow-sm"><ArrowLeft className="size-3.5" /></Link>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-rose-400" style={{ width: `${weak.score}%` }} /></div>
                  </div>
                )
              })}
              {atRisk.length === 0 && <p className="py-6 text-center text-xs text-slate-400">كل الطلاب في مستوى جيد 👏</p>}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">أفضل الطلاب</h2>
            <div className="space-y-2.5">
              {[...students].sort((a, b) => b.average - a.average).slice(0, 3).map((s, i) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <span className={cn('flex size-5 items-center justify-center rounded-md text-[9px] font-black', i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>{i + 1}</span>
                  <Avatar name={s.name} color={s.avatarColor} size="xs" />
                  <p className="flex-1 truncate text-[11px] font-bold text-slate-700">{s.name}</p>
                  <span className="text-[11px] font-extrabold text-emerald-600">{s.average}٪</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-brand-50 p-3">
              <p className="text-[10px] leading-5 text-brand-800"><b>اقتراح ذكي:</b> خصص حصة مراجعة للتكامل — ٦٥٪ من الفصل دون المتوسط.</p>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">نتائج الامتحانات الأخيرة</h2>
          <Link to="/app/exams" className="text-[11px] font-bold text-brand-600">كل الامتحانات</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {myExams.filter((e) => e.attempts > 0).slice(0, 3).map((e) => (
            <Link key={e.id} to={`/app/exams/${e.id}`} className="rounded-xl border border-slate-100 p-3.5 transition hover:border-brand-200 hover:bg-brand-50/20">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><FileQuestion className="size-4" /></span>
                <p className="flex-1 truncate text-[11px] font-bold text-slate-800">{e.title}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{getSubject(e.subjectId)?.name} • {e.attempts} تسليم</span>
                <span className={cn('font-extrabold', e.averageScore >= 80 ? 'text-emerald-600' : 'text-amber-600')}>{e.averageScore}٪</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Student / Parent shared                                             */
/* ------------------------------------------------------------------ */

function StudentResults({ student, parentView = false }: { student: Student; parentView?: boolean }) {
  const { db, getClass, getSubject } = useStore()
  const results = db.attempts
    .filter((a) => a.studentId === student.id)
    .map((a) => ({ attempt: a, exam: db.exams.find((e) => e.id === a.examId)! }))
    .filter((x) => x.exam)
  const sorted = [...results].sort((a, b) => b.attempt.submittedAt.localeCompare(a.attempt.submittedAt))
  const best = results.length ? Math.max(...results.map((r) => Math.round((r.attempt.score / r.attempt.total) * 100))) : 0
  const skills = studentSkills[student.id] ?? studentSkills.stu_1
  const weakest = [...skills].sort((a, b) => a.score - b.score)[0]
  const strongest = [...skills].sort((a, b) => b.score - a.score)[0]
  const classStudents = db.students.filter((s) => s.classId === student.classId)
  const rank = classStudents.filter((s) => s.average > student.average).length + 1

  return (
    <div>
      <PageHeader
        title={parentView ? `درجات ${student.name.split(' ')[0]}` : 'درجاتي'}
        subtitle={parentView ? 'كل نتائج الامتحانات والدرجات في مكان واحد.' : 'تابع نتائجك، اعرف مستواك، وركّز على ما يحتاج تحسينًا.'}
        actions={
          <>
            <Badge tone="brand">فصل {getClass(student.classId)?.name}</Badge>
            <Badge tone={student.average >= 80 ? 'emerald' : 'amber'}>{gradeLabel(student.average)}</Badge>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="المعدل العام" value={`${student.average}%`} icon={TrendingUp} tone="emerald" delta="+٦٪" hint="هذا الشهر" />
        <StatCard label="الترتيب في الفصل" value={`#${rank}`} icon={Trophy} tone="amber" hint={`من ${classStudents.length}`} />
        <StatCard label="الامتحانات المكتملة" value={results.length} icon={FileQuestion} tone="brand" />
        <StatCard label="أعلى درجة" value={`${best}%`} icon={GraduationCap} tone="violet" hint="أفضل نتيجة" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">تطور المستوى</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">متوسط الدرجات خلال ٦ أسابيع</p>
            </div>
            <Badge tone="emerald">+١٦٪</Badge>
          </div>
          <AreaChart data={weeklyPerformance} height={210} />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-slate-900">خريطة المهارات</h2>
          <RadarChart data={skills} compare={[78, 70, 68, 64, 82]} size={240} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <p className="text-[9px] font-bold text-emerald-600">أقوى مهارة</p>
              <p className="mt-0.5 text-[11px] font-extrabold text-emerald-800">{strongest.skill} — {strongest.score}٪</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-2.5">
              <p className="text-[9px] font-bold text-rose-600">تحتاج تركيز</p>
              <p className="mt-0.5 text-[11px] font-extrabold text-rose-800">{weakest.skill} — {weakest.score}٪</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">سجل الامتحانات</h2>
            <span className="text-[10px] text-slate-400">{sorted.length} نتيجة</span>
          </div>
          {sorted.length === 0 ? (
            <EmptyState icon={BarChart3} title="لا توجد نتائج بعد" description="ابدأ بحل أول امتحان لتظهر نتائجك هنا." />
          ) : (
            <div className="divide-y divide-slate-50">
              {sorted.map(({ attempt, exam }) => {
                const pct = Math.round((attempt.score / attempt.total) * 100)
                return (
                  <div key={attempt.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-black text-brand-600">{pct}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{exam.title}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{getSubject(exam.subjectId)?.name} • {relativeDay(attempt.submittedAt)} • {attempt.timeSpentMin} دقيقة</p>
                    </div>
                    <div className="text-end">
                      <p className="text-xs font-extrabold text-slate-800">{attempt.score} / {attempt.total}</p>
                      <Badge tone={pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose'} className="mt-1">{pct >= 80 ? 'ممتاز' : pct >= 60 ? 'جيد' : 'يحتاج تحسين'}</Badge>
                    </div>
                    <Link to={`/app/exams/${exam.id}`}><Button variant="secondary" size="sm">التفاصيل</Button></Link>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-extrabold text-slate-900">المواد الدراسية</h2>
            <div className="space-y-3">
              {subjectPerformance.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-slate-600">{s.label}</span>
                    <span className="font-bold text-slate-800">{s.value}٪</span>
                  </div>
                  <ProgressBar value={s.value} size="sm" tone={s.value >= 85 ? 'emerald' : s.value >= 70 ? 'brand' : 'amber'} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><Target className="size-4 text-brand-600" /> توصيات لك</h2>
            <div className="space-y-2">
              {[
                'راجع ريلز «المشتقة ببساطة» قبل الاختبار القادم.',
                `خصص ٢٠ دقيقة يوميًا لمهارة ${weakest.skill}.`,
                'حل الاختبار التجريبي مرة أخرى لرفع متوسطك.',
              ].map((t, i) => (
                <div key={i} className="flex gap-2 rounded-xl bg-slate-50 p-2.5 text-[10px] leading-5 text-slate-600">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[8px] font-bold text-white">{i + 1}</span>
                  {t}
                </div>
              ))}
            </div>
            <Link to="/app/reels"><Button variant="soft" size="sm" className="mt-3 w-full">شاهد الريلز المقترحة <ArrowLeft className="size-3" /></Button></Link>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">معلموك</h2>
            <div className="space-y-2.5">
              {db.teachers.filter((t) => t.classIds.includes(student.classId)).slice(0, 3).map((t) => (
                <Link key={t.id} to={`/app/teachers/${t.id}`} className="flex items-center gap-2">
                  <Avatar name={t.name} color={t.avatarColor} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-700">{t.name}</p>
                    <p className="text-[9px] text-slate-400">{getSubject(t.subjectIds[0])?.name}</p>
                  </div>
                  <ArrowLeft className="size-3 text-slate-300" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ParentResults() {
  const { currentUser, db } = useStore()
  const me = currentUser as Parent
  const children = db.students.filter((s) => me.studentIds.includes(s.id))
  const [childId, setChildId] = useState(children[0]?.id ?? '')
  const child = children.find((c) => c.id === childId) ?? children[0]
  if (!child) return <EmptyState icon={Users} title="لا يوجد أبناء" />
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <select className="select w-44" value={child.id} onChange={(e) => setChildId(e.target.value)}>
          {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <StudentResults student={child} parentView />
    </div>
  )
}
