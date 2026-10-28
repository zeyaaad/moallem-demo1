import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Award, BarChart3, BookOpen, CalendarCheck, CheckCircle2, Flame, GraduationCap,
  Sparkles, Star, Target, TrendingUp, Trophy, Zap,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Student } from '../../types'
import { Badge, Card, EmptyState, PageHeader, StatCard } from '../../components/ui'
import { AreaChart, BarChart, RadarChart } from '../../components/charts'
import { studentSkills, weeklyPerformance } from '../../data/content'
import { cn, formatNumber, gradeLabel, relativeDay } from '../../lib/utils'

export default function ProgressPage() {
  const { currentUser, db } = useStore()
  const me = currentUser as Student
  const student = db.students.find((s) => s.id === currentUser?.id) ?? me

  const attempts = useMemo(
    () => (student ? db.attempts.filter((a) => a.studentId === student.id) : []),
    [db.attempts, student],
  )
  const attendance = useMemo(
    () => (student ? db.attendance.filter((a) => a.studentId === student.id) : []),
    [db.attendance, student],
  )

  if (!student) {
    return <Card><EmptyState icon={GraduationCap} title="لا توجد بيانات" description="هذه الصفحة مخصصة لحساب الطالب." /></Card>
  }

  const skills = studentSkills[student.id] ?? studentSkills.stu_1
  const weakest = [...skills].sort((a, b) => a.score - b.score)[0]
  const best = [...skills].sort((a, b) => b.score - a.score)[0]
  const level = student.level
  const nextLevelAt = (level + 1) * 350
  const levelProgress = Math.round(((student.points % 350) / 350) * 100)
  const examTrend = attempts.length
    ? [...attempts]
        .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
        .map((a, i) => ({ label: `م${i + 1}`, value: Math.round((a.score / a.total) * 100) }))
    : weeklyPerformance

  const subjectStats = db.subjects
    .map((subject) => {
      const subjectExams = db.exams.filter((e) => e.subjectId === subject.id)
      const subjectAttempts = attempts.filter((a) => subjectExams.some((e) => e.id === a.examId))
      const avg = subjectAttempts.length
        ? Math.round(subjectAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / subjectAttempts.length)
        : null
      return { subject, avg, exams: subjectExams.length }
    })
    .filter((x) => x.avg !== null)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))

  const absence = attendance.filter((a) => a.status === 'absent').length
  const achievements = [
    { title: 'متعلم نشط', desc: 'حل ١٠ امتحانات أو أكثر', icon: Flame, earned: attempts.length >= 10, color: 'amber' },
    { title: 'متفوق', desc: 'متوسط أعلى من ٩٠٪', icon: Trophy, earned: student.average >= 90, color: 'brand' },
    { title: 'حضور مثالي', desc: 'نسبة حضور ٩٥٪ أو أكثر', icon: CalendarCheck, earned: student.attendanceRate >= 95, color: 'emerald' },
    { title: 'جامع النقاط', desc: 'أكثر من ٢٥٠٠ نقطة', icon: Zap, earned: student.points >= 2500, color: 'violet' },
  ]

  return (
    <div>
      <PageHeader
        title="تقدمي"
        subtitle="رحلة تعلمك في صورة واضحة: مستواك، مهاراتك، وإنجازاتك."
        actions={<Badge tone="violet"><Sparkles className="size-3" /> تحليل ذكي</Badge>}
      />

      <Card className="mb-5 overflow-hidden">
        <div className="relative bg-slate-950 p-6 text-white">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-700 via-brand-700/60 to-teal-600/50" />
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold text-white/60">المستوى الحالي</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-4xl font-black">{level}</span>
                <span className="mb-1.5 text-xs font-bold text-white/60">/ مستوى التعلم</span>
              </div>
              <p className="mt-2 max-w-md text-[11px] leading-5 text-white/70">
                أنت في {gradeLabel(student.average)} — تحتاج {nextLevelAt - student.points} نقطة للوصول إلى المستوى {level + 1}.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold">
                <span className="text-white/70">التقدم للمستوى التالي</span>
                <span>{levelProgress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="mt-2 text-[10px] text-white/50">{formatNumber(student.points)} نقطة • {nextLevelAt} نقطة للمستوى التالي</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <Award className="size-8 text-amber-300" />
              <div>
                <p className="text-xs font-extrabold">الترتيب #{student.rank}</p>
                <p className="text-[10px] text-white/60">في فصل {db.classes.find((c) => c.id === student.classId)?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="المتوسط العام" value={`${student.average}%`} icon={TrendingUp} tone="emerald" delta="+٤٪" hint="هذا الشهر" />
        <StatCard label="الامتحانات المكتملة" value={attempts.length} icon={BookOpen} tone="brand" hint={`${db.exams.filter((e) => e.classId === student.classId).length} متاح`} />
        <StatCard label="نقاط التميز" value={formatNumber(student.points)} icon={Star} tone="amber" hint={`المستوى ${level}`} />
        <StatCard label="أيام الغياب" value={absence} icon={CalendarCheck} tone="rose" hint={`حضور ${student.attendanceRate}%`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">تطور درجاتك</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">نتائج امتحاناتك مرتبة زمنيًا</p>
            </div>
            <Badge tone="brand">{attempts.length} محاولة</Badge>
          </div>
          <AreaChart data={examTrend} height={220} color="#6366f1" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 p-2.5"><p className="text-base font-black text-emerald-700">{Math.max(0, ...attempts.map((a) => Math.round((a.score / a.total) * 100)))}%</p><p className="text-[9px] font-bold text-emerald-600">أعلى درجة</p></div>
            <div className="rounded-xl bg-brand-50 p-2.5"><p className="text-base font-black text-brand-700">{student.average}%</p><p className="text-[9px] font-bold text-brand-600">المتوسط</p></div>
            <div className="rounded-xl bg-amber-50 p-2.5"><p className="text-base font-black text-amber-700">{attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length) : 0}%</p><p className="text-[9px] font-bold text-amber-600">متوسط المحاولات</p></div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">خريطة المهارات</h2>
            <Link to="/app/results" className="text-[10px] font-bold text-brand-600">التفاصيل</Link>
          </div>
          <RadarChart data={skills} size={250} color="#10b981" />
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-[10px] text-emerald-800">
              <CheckCircle2 className="size-3.5 shrink-0" /> أقوى مهارة: <b>{best.skill}</b> ({best.score}%)
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-[10px] text-amber-800">
              <Target className="size-3.5 shrink-0" /> تحتاج تدريبًا على: <b>{weakest.skill}</b> ({weakest.score}%)
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">الأداء حسب المادة</h2>
            <Badge tone="slate">{subjectStats.length} مواد</Badge>
          </div>
          {subjectStats.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">حل امتحانًا واحدًا على الأقل لعرض تحليل المواد.</p>
          ) : (
            <>
              <BarChart data={subjectStats.map((s) => ({ label: s.subject.name.replace('اللغة ', '').slice(0, 8), value: s.avg ?? 0 }))} height={190} color="#0ea5e9" />
              <div className="mt-3 space-y-2">
                {subjectStats.map((s) => (
                  <div key={s.subject.id} className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: s.subject.color }} />
                    <span className="flex-1 text-[11px] font-semibold text-slate-600">{s.subject.name}</span>
                    <span className={cn('text-[10px] font-extrabold', (s.avg ?? 0) >= 80 ? 'text-emerald-600' : (s.avg ?? 0) >= 60 ? 'text-amber-600' : 'text-rose-600')}>{s.avg}%</span>
                    <Link to="/app/reels" className="text-[9px] font-bold text-brand-600">راجع</Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">إنجازاتي</h2>
            <Badge tone="amber">{achievements.filter((a) => a.earned).length} / {achievements.length}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div key={achievement.title} className={cn('rounded-2xl border p-3.5 text-center transition', achievement.earned ? 'border-brand-100 bg-brand-50/50' : 'border-slate-100 bg-slate-50/60 opacity-60')}>
                <span className={cn('mx-auto flex size-11 items-center justify-center rounded-2xl', achievement.earned ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-slate-200 text-slate-400')}>
                  <achievement.icon className="size-5" />
                </span>
                <p className="mt-2 text-[11px] font-extrabold text-slate-800">{achievement.title}</p>
                <p className="mt-0.5 text-[9px] leading-4 text-slate-400">{achievement.desc}</p>
                <p className={cn('mt-1.5 text-[9px] font-bold', achievement.earned ? 'text-emerald-600' : 'text-slate-400')}>{achievement.earned ? 'تم الإنجاز' : 'لم يكتمل بعد'}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
            <Sparkles className="size-4 shrink-0 text-violet-500" /> استمر في حل الامتحانات ومشاهدة الريلز لفتح المزيد من الإنجازات.
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-extrabold text-slate-900">خطة التعلم المقترحة</h2>
          <Badge tone="violet"><Sparkles className="size-3" /> مخصصة لك</Badge>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          {[
            { icon: BookOpen, title: `راجع ${weakest.skill}`, body: 'شاهد ريلز المهارة وحل ٥ أسئلة تدريبية.', to: '/app/reels', tone: 'brand' },
            { icon: BarChart3, title: 'امتحان تدريبي', body: 'حل أقرب امتحان متاح لقياس تقدمك.', to: '/app/exams', tone: 'sky' },
            { icon: Trophy, title: 'حافظ على مستواك', body: 'حل امتحانًا واحدًا يوميًا لمدة أسبوع.', to: '/app/exams', tone: 'amber' },
          ].map((item) => (
            <Link key={item.title} to={item.to} className="group rounded-2xl border border-slate-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/20">
              <span className={cn('flex size-9 items-center justify-center rounded-xl', item.tone === 'brand' ? 'bg-brand-50 text-brand-600' : item.tone === 'sky' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600')}>
                <item.icon className="size-4" />
              </span>
              <p className="mt-2.5 text-xs font-extrabold text-slate-800">{item.title}</p>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">{item.body}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-brand-600">ابدأ <ArrowLeft className="size-3" /></span>
            </Link>
          ))}
        </div>
      </Card>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <CalendarCheck className="size-3.5" /> آخر تحديث لبياناتك: {relativeDay(new Date().toISOString().slice(0, 10))} • نسخة تجريبية
      </p>
    </div>
  )
}
