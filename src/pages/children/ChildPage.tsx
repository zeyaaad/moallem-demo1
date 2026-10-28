import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, CalendarCheck, CheckCircle2, Clock, GraduationCap, Mail, Sparkles, Target,
  TrendingUp, Trophy, UserX, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, ProgressBar, StatCard } from '../../components/ui'
import { AttendanceHeatmap, RadarChart } from '../../components/charts'
import { studentSkills } from '../../data/content'
import { cn, formatDate, gradeLabel, relativeDay } from '../../lib/utils'

export default function ChildPage() {
  const { currentUser, db, getSubject } = useStore()
  const parent = db.parents.find((p) => p.id === currentUser?.id)
  const children = db.students.filter((s) => parent?.studentIds.includes(s.id))
  const [childId, setChildId] = useState(children[0]?.id ?? '')
  const child = children.find((c) => c.id === childId) ?? children[0]

  const attempts = useMemo(
    () => (child ? db.attempts.filter((a) => a.studentId === child.id) : []),
    [child, db.attempts],
  )
  const attendance = useMemo(
    () => (child ? db.attendance.filter((a) => a.studentId === child.id) : []),
    [child, db.attendance],
  )

  if (!child) {
    return (
      <div>
        <PageHeader title="مستوى ابني" subtitle="تابع مستوى أبنائك ودرجاتهم وحضورهم." />
        <Card><EmptyState icon={Users} title="لا يوجد طالب مرتبط بحسابك" description="يرجى التواصل مع إدارة المدرسة لربط حسابك بأبنائك." /></Card>
      </div>
    )
  }

  const cls = db.classes.find((c) => c.id === child.classId)
  const grade = db.gradeLevels.find((g) => g.id === child.gradeLevelId)
  const skills = studentSkills[child.id] ?? studentSkills.stu_1
  const weakest = [...skills].sort((a, b) => a.score - b.score)[0]
  const best = [...skills].sort((a, b) => b.score - a.score)[0]
  const absent = attendance.filter((a) => a.status === 'absent').length
  const late = attendance.filter((a) => a.status === 'late').length
  const excused = attendance.filter((a) => a.status === 'excused').length
  const present = attendance.filter((a) => a.status === 'present').length
  const teachers = db.teachers.filter((t) => t.classIds.includes(child.classId))
  const recentExams = [...attempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 4)
  const ranked = [...db.students.filter((s) => s.classId === child.classId)].sort((a, b) => b.average - a.average)
  const rank = ranked.findIndex((s) => s.id === child.id) + 1

  return (
    <div>
      <PageHeader
        title="مستوى ابني"
        subtitle="صورة شاملة عن المستوى الدراسي، السلوك، والحضور — خطوة بخطوة."
        actions={children.length > 1 ? (
          <select className="select w-48" value={child.id} onChange={(e) => setChildId(e.target.value)}>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : <Badge tone="brand"><GraduationCap className="size-3" /> {grade?.name}</Badge>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {children.map((c) => (
          <button key={c.id} onClick={() => setChildId(c.id)} className={cn('flex items-center gap-3 rounded-2xl border p-3 text-start transition', c.id === child.id ? 'border-brand-300 bg-brand-50/50 ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:bg-slate-50')}>
            <Avatar name={c.name} color={c.avatarColor} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold text-slate-800">{c.name}</p>
              <p className="text-[10px] text-slate-400">فصل {db.classes.find((x) => x.id === c.classId)?.name} • {c.average}%</p>
            </div>
            {c.id === child.id && <CheckCircle2 className="size-4 text-brand-600" />}
          </button>
        ))}
      </div>

      <Card className="mb-5 overflow-hidden">
        <div className="relative bg-slate-950 p-5 text-white">
          <div className="absolute inset-0 bg-gradient-to-l from-teal-600/80 via-brand-700/70 to-slate-950" />
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="relative flex flex-wrap items-center gap-4">
            <Avatar name={child.name} color={child.avatarColor} size="xl" className="ring-4 ring-white/20" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black">{child.name}</h2>
              <p className="mt-1 text-[11px] text-white/60">{grade?.name} • فصل {cls?.name} • {child.code}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold backdrop-blur">الترتيب #{rank} في الفصل</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold backdrop-blur">{gradeLabel(child.average)}</span>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">حضور {child.attendanceRate}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-white/50">المتوسط العام</p>
              <p className="text-3xl font-black">{child.average}%</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
          <p className="text-[10px] text-slate-400">آخر تحديث: {formatDate(new Date().toISOString().slice(0, 10))} • بيانات تجريبية</p>
          <div className="flex gap-1.5">
            <Link to="/app/results"><Button size="sm" variant="secondary"><TrendingUp className="size-3.5" /> الدرجات</Button></Link>
            <Link to={`/app/students/${child.id}`}><Button size="sm"><BookOpen className="size-3.5" /> الملف الكامل</Button></Link>
          </div>
        </div>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="المتوسط العام" value={`${child.average}%`} icon={TrendingUp} tone="emerald" delta="+٦٪" hint="هذا الشهر" />
        <StatCard label="نسبة الحضور" value={`${child.attendanceRate}%`} icon={CalendarCheck} tone="sky" hint={`${absent} أيام غياب`} />
        <StatCard label="أيام الغياب" value={absent} icon={UserX} tone="rose" hint="خلال الفصل" />
        <StatCard label="نقاط التميز" value={child.points} icon={Trophy} tone="amber" hint={`المستوى ${child.level}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">المهارات ونقاط القوة</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">تحليل أداء {child.name.split(' ')[0]} في المهارات الأساسية</p>
              </div>
              <Badge tone="violet"><Sparkles className="size-3" /> تحليل ذكي</Badge>
            </div>
            <div className="grid items-center gap-4 sm:grid-cols-2">
              <RadarChart data={skills} size={250} color="#0ea5a4" />
              <div className="space-y-2.5">
                {skills.map((s) => (
                  <div key={s.skill}>
                    <div className="mb-1 flex items-center justify-between text-[11px]"><span className="font-semibold text-slate-600">{s.skill}</span><span className={cn('font-extrabold', s.score >= 80 ? 'text-emerald-600' : s.score >= 60 ? 'text-amber-600' : 'text-rose-600')}>{s.score}%</span></div>
                    <ProgressBar value={s.score} size="sm" tone={s.score >= 80 ? 'emerald' : s.score >= 60 ? 'amber' : 'rose'} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-[10px] text-emerald-800"><CheckCircle2 className="size-4 shrink-0" /> <span>أقوى مهارة: <b>{best.skill}</b> ({best.score}%)</span></div>
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-[10px] text-amber-800"><Target className="size-4 shrink-0" /> <span>يحتاج دعمًا في: <b>{weakest.skill}</b> ({weakest.score}%)</span></div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-900">آخر الامتحانات</h2>
              <Link to="/app/results" className="text-[11px] font-bold text-brand-600">كل النتائج</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentExams.map((attempt) => {
                const exam = db.exams.find((e) => e.id === attempt.examId)
                const pct = Math.round((attempt.score / attempt.total) * 100)
                return (
                  <div key={attempt.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <span className={cn('flex size-10 items-center justify-center rounded-xl text-xs font-black', pct >= 80 ? 'bg-emerald-50 text-emerald-600' : pct >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')}>{pct}%</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{exam?.title ?? 'امتحان'}</p>
                      <p className="mt-0.5 text-[9px] text-slate-400">{exam ? getSubject(exam.subjectId)?.name : ''} • {relativeDay(attempt.submittedAt)} • {attempt.timeSpentMin} دقيقة</p>
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-600">{attempt.score} / {attempt.total}</span>
                    {exam && <Link to={`/app/exams/${exam.id}`} className="text-[10px] font-bold text-brand-600">التفاصيل</Link>}
                  </div>
                )
              })}
              {recentExams.length === 0 && <p className="px-5 py-10 text-center text-xs text-slate-400">لم يحل {child.name.split(' ')[0]} أي امتحان بعد.</p>}
            </div>
          </Card>

          <Card className="border-brand-100 bg-brand-50/40 p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-brand-900"><Sparkles className="size-4" /> توصيات لدعم {child.name.split(' ')[0]}</h2>
            <ul className="mt-3 space-y-2 text-[11px] leading-6 text-brand-800">
              <li className="flex gap-2"><CheckCircle2 className="mt-1 size-3.5 shrink-0" /> خصص ١٥ دقيقة يوميًا لمراجعة مهارة «{weakest.skill}» باستخدام ريلز المادة.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 size-3.5 shrink-0" /> شجّعه على حل امتحان تدريبي أسبوعيًا ومقارنة النتيجة.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 size-3.5 shrink-0" /> تواصل مع معلم المادة عند استمرار انخفاض الدرجات.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 size-3.5 shrink-0" /> {absent > 2 ? `متابعة أسباب الغياب (${absent} أيام) مع إدارة المدرسة.` : 'الحفاظ على انتظام الحضور —这是他 أحد أهم عوامل التفوق.'}</li>
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">سجل الحضور</h2>
              <Badge tone={child.attendanceRate >= 90 ? 'emerald' : 'amber'}>{child.attendanceRate}%</Badge>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-center"><p className="text-lg font-black text-emerald-700">{present}</p><p className="text-[9px] font-bold text-emerald-600">حاضر</p></div>
              <div className="rounded-xl bg-rose-50 p-2.5 text-center"><p className="text-lg font-black text-rose-700">{absent}</p><p className="text-[9px] font-bold text-rose-600">غائب</p></div>
              <div className="rounded-xl bg-amber-50 p-2.5 text-center"><p className="text-lg font-black text-amber-700">{late}</p><p className="text-[9px] font-bold text-amber-600">متأخر</p></div>
              <div className="rounded-xl bg-sky-50 p-2.5 text-center"><p className="text-lg font-black text-sky-700">{excused}</p><p className="text-[9px] font-bold text-sky-600">بعذر</p></div>
            </div>
            <AttendanceHeatmap records={attendance} days={35} />
            <Link to="/app/attendance" className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-100">التفاصيل <ArrowLeft className="size-3" /></Link>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><Clock className="size-4 text-slate-400" /> الغياب الأخير</h2>
            <div className="space-y-2">
              {attendance.filter((a) => a.status === 'absent' || a.status === 'late').slice(-4).reverse().map((record) => (
                <div key={record.id} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5">
                  <span className={cn('size-2 rounded-full', record.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-700">{formatDate(record.date)}</p>
                    <p className="text-[9px] text-slate-400">{record.status === 'absent' ? 'غياب' : 'تأخر'} — فصل {db.classes.find((c) => c.id === record.classId)?.name}</p>
                  </div>
                </div>
              ))}
              {attendance.filter((a) => a.status !== 'present').length === 0 && <p className="py-4 text-center text-[11px] text-slate-400">لا يوجد غياب أو تأخير مسجل.</p>}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><GraduationCap className="size-4 text-brand-500" /> معلمو الفصل</h2>
            <div className="space-y-2">
              {teachers.slice(0, 5).map((teacher) => (
                <Link key={teacher.id} to={`/app/teachers/${teacher.id}`} className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-50">
                  <Avatar name={teacher.name} color={teacher.avatarColor} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-700">{teacher.name}</p>
                    <p className="text-[9px] text-slate-400">{teacher.subjectIds.map((sid) => getSubject(sid)?.name).filter(Boolean).join(' • ')}</p>
                  </div>
                  <Mail className="size-3.5 text-slate-300" />
                </Link>
              ))}
              {teachers.length === 0 && <p className="py-4 text-center text-[11px] text-slate-400">لا يوجد معلمون مرتبطون بالفصل.</p>}
            </div>
            <Link to="/app/teachers" className="mt-3 block text-center text-[10px] font-bold text-brand-600">كل المعلمين</Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
