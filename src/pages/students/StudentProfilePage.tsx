import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, Download, GraduationCap, Mail, Phone,
  Sparkles, Target, TrendingUp, Trophy, UserRound, Users, XCircle,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Student } from '../../types'
import { Avatar, Badge, Button, Card, InfoRow, ProgressBar, StatCard, useToast } from '../../components/ui'
import { AreaChart, AttendanceHeatmap, RadarChart } from '../../components/charts'
import { studentSkills, weeklyPerformance } from '../../data/content'
import { cn, formatDate, formatNumber, gradeLabel, relativeDay } from '../../lib/utils'

export default function StudentProfilePage() {
  const { id } = useParams()
  const { currentUser, db, getClass, getGrade, getParent, getSubject } = useStore()
  const { push } = useToast()
  const student = db.students.find((s) => s.id === id) ?? (currentUser?.role === 'student' ? currentUser as Student : null)

  const attempts = useMemo(
    () => (student ? db.attempts.filter((a) => a.studentId === student.id) : []),
    [db.attempts, student],
  )
  const attendance = useMemo(
    () => (student ? db.attendance.filter((a) => a.studentId === student.id) : []),
    [db.attendance, student],
  )

  if (!student) {
    return (
      <Card>
        <div className="p-10 text-center text-sm text-slate-500">
          الطالب غير موجود. <Link to="/app/students" className="font-bold text-brand-600">العودة للطلاب</Link>
        </div>
      </Card>
    )
  }

  const cls = getClass(student.classId)
  const grade = getGrade(student.gradeLevelId)
  const parent = getParent(student.parentId)
  const skills = studentSkills[student.id] ?? studentSkills.stu_1
  const weakest = [...skills].sort((a, b) => a.score - b.score).slice(0, 2)
  const absent = attendance.filter((a) => a.status === 'absent').length
  const late = attendance.filter((a) => a.status === 'late').length
  const excused = attendance.filter((a) => a.status === 'excused').length
  const present = attendance.filter((a) => a.status === 'present').length
  const teachers = db.teachers.filter((t) => t.classIds.includes(student.classId))
  const isManager = currentUser?.role === 'manager'
  const canMessage = currentUser?.role !== 'student'

  const trend = attempts.length
    ? [...attempts]
        .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
        .map((a, i) => ({ label: `${i + 1}`, value: Math.round((a.score / a.total) * 100) }))
    : weeklyPerformance

  return (
    <div>
      <Link to="/app/students" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
        <ArrowRight className="size-3.5" /> العودة للطلاب
      </Link>

      <Card className="mb-5 overflow-hidden">
        <div className="relative h-28 bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-700 via-brand-600/70 to-teal-600/60" />
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="absolute end-5 top-5 flex gap-2">
            <Badge tone="slate" className="border-white/15 bg-white/10 text-white"><Sparkles className="size-3" /> نسخة تجريبية</Badge>
          </div>
        </div>
        <div className="relative px-5 pb-5 pt-0 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar name={student.name} color={student.avatarColor} size="xl" className="ring-4 ring-white" />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{student.name}</h1>
                  <Badge tone={student.average >= 85 ? 'emerald' : student.average >= 65 ? 'brand' : 'rose'} dot>
                    {student.average >= 85 ? 'متميز' : student.average >= 65 ? 'منتظم' : 'يحتاج دعمًا'}
                  </Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span>{student.code}</span>
                  <span>•</span>
                  <span>فصل {cls?.name}</span>
                  <span>•</span>
                  <span>{grade?.name}</span>
                  <span>•</span>
                  <span>{student.email}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              {canMessage && parent && (
                <a href={`mailto:${parent.email}`}><Button variant="secondary" size="sm"><Mail className="size-3.5" /> مراسلة ولي الأمر</Button></a>
              )}
              <Button size="sm" onClick={() => push({ title: 'تم تجهيز التقرير', body: 'نسخة PDF تجريبية من ملف الطالب.', tone: 'success' })}>
                <Download className="size-3.5" /> تصدير الملف
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="المتوسط العام" value={`${student.average}%`} icon={TrendingUp} tone="emerald" delta="+٤٪" hint="هذا الشهر" />
        <StatCard label="نسبة الحضور" value={`${student.attendanceRate}%`} icon={CalendarDays} tone="sky" hint={`${absent} يوم غياب`} />
        <StatCard label="الترتيب في الفصل" value={`#${student.rank}`} icon={Trophy} tone="amber" hint={`من ${db.students.filter((s) => s.classId === student.classId).length} طالبًا`} />
        <StatCard label="نقاط التميز" value={formatNumber(student.points)} icon={Target} tone="violet" hint={`المستوى ${student.level}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">تطور الأداء</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">نتائج المحاولات مرتبة زمنيًا</p>
              </div>
              <Badge tone="brand">{attempts.length} محاولة</Badge>
            </div>
            <AreaChart data={trend} height={200} color="#10b981" />
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">خريطة المهارات</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">نقاط القوة والضعف بناءً على آخر الامتحانات</p>
              </div>
              <Badge tone="violet"><Sparkles className="size-3" /> تحليل ذكي</Badge>
            </div>
            <div className="grid items-center gap-4 sm:grid-cols-2">
              <RadarChart data={skills} size={250} color="#6366f1" />
              <div className="space-y-2.5">
                {skills.map((s) => (
                  <div key={s.skill}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">{s.skill}</span>
                      <span className={cn('font-extrabold', s.score >= 80 ? 'text-emerald-600' : s.score >= 60 ? 'text-amber-600' : 'text-rose-600')}>{s.score}%</span>
                    </div>
                    <ProgressBar value={s.score} size="sm" tone={s.score >= 80 ? 'emerald' : s.score >= 60 ? 'amber' : 'rose'} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-[11px] leading-6 text-amber-800">
              <b>توصية المعلم:</b> يحتاج {student.name.split(' ')[0]} إلى تدريب إضافي على مهارة «{weakest[0].skill}» عبر ريلز المادة وورقة عمل قصيرة، مع متابعة أسبوعية.
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-900">نتائج الامتحانات</h2>
              <Link to="/app/results" className="text-[11px] font-bold text-brand-600">كل النتائج</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead><tr className="table-head"><th className="px-5 py-3">الامتحان</th><th className="px-3 py-3">المادة</th><th className="px-3 py-3">الدرجة</th><th className="px-3 py-3">التاريخ</th><th className="px-5 py-3">الحالة</th></tr></thead>
                <tbody>
                  {attempts.map((a) => {
                    const exam = db.exams.find((e) => e.id === a.examId)
                    const pct = Math.round((a.score / a.total) * 100)
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/60">
                        <td className="table-cell">
                          {exam ? <Link to={`/app/exams/${exam.id}`} className="text-xs font-bold text-slate-800 hover:text-brand-600">{exam.title}</Link> : <span className="text-xs text-slate-400">امتحان محذوف</span>}
                        </td>
                        <td className="table-cell text-[11px] text-slate-500">{exam ? getSubject(exam.subjectId)?.name : '—'}</td>
                        <td className="table-cell text-xs font-extrabold text-slate-700">{a.score} / {a.total} <span className="text-[10px] font-bold text-slate-400">({pct}%)</span></td>
                        <td className="table-cell text-[11px] text-slate-500">{relativeDay(a.submittedAt)}</td>
                        <td className="table-cell"><Badge tone={pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose'}>{gradeLabel(pct)}</Badge></td>
                      </tr>
                    )
                  })}
                  {attempts.length === 0 && <tr><td colSpan={5} className="table-cell py-8 text-center text-xs text-slate-400">لا توجد نتائج بعد.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">البيانات الأساسية</h2>
            <InfoRow label="الكود" value={student.code} />
            <InfoRow label="الفصل" value={cls?.name ?? '—'} />
            <InfoRow label="المستوى" value={grade?.name ?? '—'} />
            <InfoRow label="تاريخ التسجيل" value={formatDate(student.createdAt)} />
            <InfoRow label="الهاتف" value={<span dir="ltr">{student.phone}</span>} />
            <InfoRow label="الحالة" value={<Badge tone={student.status === 'active' ? 'emerald' : 'rose'} dot>{student.status === 'active' ? 'نشط' : 'موقوف'}</Badge>} />
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">الحضور والغياب</h2>
              <Badge tone={student.attendanceRate >= 90 ? 'emerald' : student.attendanceRate >= 75 ? 'amber' : 'rose'}>{student.attendanceRate}%</Badge>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-center"><p className="text-lg font-black text-emerald-700">{present}</p><p className="text-[9px] font-bold text-emerald-600">حاضر</p></div>
              <div className="rounded-xl bg-rose-50 p-2.5 text-center"><p className="text-lg font-black text-rose-700">{absent}</p><p className="text-[9px] font-bold text-rose-600">غائب</p></div>
              <div className="rounded-xl bg-amber-50 p-2.5 text-center"><p className="text-lg font-black text-amber-700">{late}</p><p className="text-[9px] font-bold text-amber-600">متأخر</p></div>
              <div className="rounded-xl bg-sky-50 p-2.5 text-center"><p className="text-lg font-black text-sky-700">{excused}</p><p className="text-[9px] font-bold text-sky-600">بعذر</p></div>
            </div>
            <AttendanceHeatmap records={attendance} days={35} />
          </Card>

          {parent && (
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><Users className="size-4 text-brand-500" /> ولي الأمر</h2>
              <div className="flex items-center gap-3">
                <Avatar name={parent.name} color={parent.avatarColor} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">{parent.name}</p>
                  <p className="text-[10px] text-slate-400">{parent.job}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                <p className="flex items-center gap-2"><Phone className="size-3.5" /> <span dir="ltr">{parent.phone}</span></p>
                <p className="flex items-center gap-2"><Mail className="size-3.5" /> {parent.email}</p>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><GraduationCap className="size-4 text-brand-500" /> معلمو الفصل</h2>
            <div className="space-y-2">
              {teachers.map((t) => (
                <Link key={t.id} to={`/app/teachers/${t.id}`} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:bg-slate-50">
                  <Avatar name={t.name} color={t.avatarColor} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-800">{t.name}</p>
                    <p className="text-[9px] text-slate-400">{t.subjectIds.map((sid) => getSubject(sid)?.name).filter(Boolean).join(' • ')}</p>
                  </div>
                  <ArrowLeft className="size-3.5 text-slate-300" />
                </Link>
              ))}
              {teachers.length === 0 && <p className="py-3 text-center text-[11px] text-slate-400">لا يوجد معلمون مرتبطون بالفصل.</p>}
            </div>
          </Card>

          {isManager && (
            <Card className="border-dashed border-brand-200 bg-brand-50/40 p-5">
              <p className="text-xs font-extrabold text-brand-900">ملاحظات إدارية</p>
              <p className="mt-1.5 text-[11px] leading-6 text-brand-800">الطالب منتظم في الحضور. يُنصح بتفعيل خطة دعم فردية في مادة الرياضيات قبل امتحان منتصف الفصل.</p>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-brand-700"><CheckCircle2 className="size-3.5" /> تمت المراجعة بواسطة إدارة المدرسة</div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] text-slate-500">
        <Clock className="size-4 text-slate-400" /> آخر تحديث لبيانات الطالب: اليوم
        <span className="text-slate-200">|</span>
        <XCircle className="size-4 text-rose-400" /> {absent} يوم غياب خلال آخر ٤٢ يومًا
        <span className="text-slate-200">|</span>
        <UserRound className="size-4 text-brand-400" /> {attempts.length} محاولة امتحان مسجلة
        <span className="text-slate-200">|</span>
        <Badge tone="slate">فصل {cls?.name}</Badge>
      </div>
    </div>
  )
}
