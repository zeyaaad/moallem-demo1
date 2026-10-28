import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, Clapperboard, GraduationCap, Mail, Search, Star, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar, Badge, Card, EmptyState, PageHeader, SearchInput, StatCard } from '../../components/ui'
import SubjectIcon from '../../components/SubjectIcon'
import { cn, formatNumber } from '../../lib/utils'

export default function TeachersPage() {
  const { currentUser, db, school } = useStore()
  const [q, setQ] = useState('')
  const [subject, setSubject] = useState('all')

  const isParent = currentUser?.role === 'parent'
  const childSubjects = useMemo(() => {
    if (!isParent) return [] as string[]
    const parent = db.parents.find((p) => p.id === currentUser?.id)
    const children = db.students.filter((s) => parent?.studentIds.includes(s.id))
    return db.subjects.filter((s) => children.some((c) => c.gradeLevelId === s.gradeLevelId)).map((s) => s.id)
  }, [db.parents, db.students, db.subjects, currentUser?.id, isParent])

  const teachers = useMemo(() => {
    const inSchool = db.teachers.filter((t) => !school || t.schoolId === school.id)
    return inSchool
      .filter((t) => subject === 'all' || t.subjectIds.includes(subject))
      .filter((t) => !q || t.name.includes(q) || t.email.includes(q) || t.subjectIds.some((sid) => db.subjects.find((s) => s.id === sid)?.name.includes(q)))
      .sort((a, b) => {
        if (isParent) {
          const aMatch = a.subjectIds.some((sid) => childSubjects.includes(sid)) ? 1 : 0
          const bMatch = b.subjectIds.some((sid) => childSubjects.includes(sid)) ? 1 : 0
          if (aMatch !== bMatch) return bMatch - aMatch
        }
        return b.rating - a.rating
      })
  }, [childSubjects, db.subjects, db.teachers, isParent, q, school, subject])

  const avgRating = (db.teachers.reduce((sum, t) => sum + t.rating, 0) / Math.max(1, db.teachers.length)).toFixed(1)
  const subjectsUsed = new Set(db.teachers.flatMap((t) => t.subjectIds)).size

  return (
    <div>
      <PageHeader
        title="المعلمون"
        subtitle="تعرّف على معلميك، موادهم، وتقييمات الطلاب — وتواصل معهم بسهولة."
        actions={<Badge tone="brand"><GraduationCap className="size-3" /> {db.teachers.length} معلم</Badge>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="عدد المعلمين" value={db.teachers.length} icon={Users} tone="brand" hint={`${db.subjects.length} مادة`} />
        <StatCard label="متوسط التقييم" value={`${avgRating} ★`} icon={Star} tone="amber" hint="من آراء الطلاب" />
        <StatCard label="ريلز تعليمية" value={db.reels.length} icon={Clapperboard} tone="rose" hint="محتوى قصير" />
        <StatCard label="مواد مغطاة" value={subjectsUsed} icon={BookOpen} tone="emerald" hint="على مستوى المدرسة" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث باسم المعلم أو المادة…" className="w-full sm:w-72" />
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:ms-auto scrollbar-hide">
          <button onClick={() => setSubject('all')} className={cn('chip shrink-0', subject === 'all' && 'chip-active')}>كل المواد</button>
          {db.subjects.map((s) => (
            <button key={s.id} onClick={() => setSubject(s.id)} className={cn('chip shrink-0', subject === s.id && 'chip-active')}>
              <span className="size-2 rounded-full" style={{ background: s.color }} /> {s.name}
            </button>
          ))}
        </div>
      </Card>

      {teachers.length === 0 ? (
        <Card><EmptyState icon={Search} title="لا يوجد معلمون مطابقون" description="جرّب البحث باسم آخر أو اختر مادة مختلفة." /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teachers.map((teacher) => {
            const subjects = teacher.subjectIds.map((sid) => db.subjects.find((s) => s.id === sid)).filter(Boolean)
            const classes = db.classes.filter((c) => teacher.classIds.includes(c.id))
            const reels = db.reels.filter((r) => r.teacherId === teacher.id)
            const highlight = isParent && teacher.subjectIds.some((sid) => childSubjects.includes(sid))
            return (
              <Card key={teacher.id} className={cn('card-hover overflow-hidden', highlight && 'ring-2 ring-brand-200')}>
                <div className="relative h-20 bg-slate-950">
                  <div className="absolute inset-0 opacity-90" style={{ backgroundImage: `linear-gradient(120deg, ${teacher.avatarColor}, #0f172a)` }} />
                  <div className="absolute inset-0 bg-dots opacity-20" />
                  {highlight && <span className="absolute end-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-brand-700">معلم ابنك</span>}
                </div>
                <div className="px-5 pb-5">
                  <div className="-mt-7 flex items-end justify-between">
                    <Avatar name={teacher.name} color={teacher.avatarColor} size="lg" className="ring-4 ring-white" />
                    <span className="mb-1 flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-extrabold text-amber-700">
                      <Star className="size-3 fill-amber-400 text-amber-400" /> {teacher.rating}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-sm font-extrabold text-slate-900">{teacher.name}</h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      {subjects.map((s) => <span key={s!.id} className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{s!.name}</span>)}
                    </p>
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-[11px] leading-5 text-slate-500">{teacher.bio}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center">
                    <div><p className="text-xs font-extrabold text-slate-800">{teacher.experienceYears} سنة</p><p className="text-[9px] text-slate-400">خبرة</p></div>
                    <div className="border-x border-slate-200"><p className="text-xs font-extrabold text-slate-800">{formatNumber(teacher.studentsCount)}</p><p className="text-[9px] text-slate-400">طالب</p></div>
                    <div><p className="text-xs font-extrabold text-slate-800">{reels.length}</p><p className="text-[9px] text-slate-400">ريل</p></div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <Link to={`/app/teachers/${teacher.id}`} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-[11px] font-bold text-white transition hover:bg-brand-700">
                      الملف والمواد <ArrowLeft className="size-3.5" />
                    </Link>
                    <a href={`mailto:${teacher.email}`} className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50" aria-label={`مراسلة ${teacher.name}`}>
                      <Mail className="size-4" />
                    </a>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[9px] text-slate-400"><GraduationCap className="size-3" /> {classes.length} فصول • {subjects.map((s) => s?.name).join('، ')}</p>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-[11px] leading-6 text-brand-800">
        <SubjectIcon subject={db.subjects[0]} className="size-8 shrink-0" />
        <p>
          كل معلم لديه صفحة تعرض مواده، ريلز، وامتحاناته. يمكنك من صفحة المعلم الانتقال مباشرة إلى محتواه أو مراسلته.
        </p>
      </div>
    </div>
  )
}
