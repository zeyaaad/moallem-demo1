import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Clapperboard, GraduationCap, Plus, Search, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import SubjectIcon from '../../components/SubjectIcon'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, SearchInput, StatCard, useToast,
} from '../../components/ui'
import { cn, formatNumber } from '../../lib/utils'

const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

export default function ManageSubjectsPage() {
  const { db, addSubject, notify, getTeacher } = useStore()
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [teacherId, setTeacherId] = useState(db.teachers[0]?.id ?? '')
  const [gradeLevelId, setGradeLevelId] = useState(db.gradeLevels[0]?.id ?? '')
  const [color, setColor] = useState(colors[0])

  const subjects = useMemo(
    () => db.subjects
      .filter((s) => gradeFilter === 'all' || s.gradeLevelId === gradeFilter)
      .filter((s) => !q || s.name.includes(q) || getTeacher(s.teacherId)?.name.includes(q)),
    [db.subjects, gradeFilter, getTeacher, q],
  )

  const submit = () => {
    if (!name.trim()) { push({ title: 'اكتب اسم المادة', tone: 'error' }); return }
    if (!teacherId) { push({ title: 'اختر معلم المادة', tone: 'error' }); return }
    addSubject({ name: name.trim(), teacherId, gradeLevelId, color })
    notify('أضاف مادة جديدة', name)
    push({ title: 'تم إضافة المادة', body: 'تم ربط المادة بالمعلم المحدد.', tone: 'success' })
    setName('')
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="المواد الدراسية"
        subtitle="كل مادة ومعلمها وفصولها في مكان واحد — تحكم كامل في المنهج."
        actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> إضافة مادة</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="المواد" value={db.subjects.length} icon={BookOpen} tone="brand" />
        <StatCard label="معلمون" value={db.teachers.length} icon={GraduationCap} tone="sky" hint="لكل مادة معلم" />
        <StatCard label="المستويات" value={db.gradeLevels.length} icon={Users} tone="emerald" />
        <StatCard label="ريلز مرتبطة" value={db.reels.length} icon={Clapperboard} tone="rose" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث باسم المادة أو المعلم…" className="w-full sm:w-72" />
        <select className="select h-10.5 w-full sm:ms-auto sm:w-52" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
          <option value="all">كل المستويات</option>
          {db.gradeLevels.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </Card>

      {subjects.length === 0 ? (
        <Card><EmptyState icon={Search} title="لا توجد مواد مطابقة" description="جرّب بحثًا آخر أو أضف مادة جديدة." action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> إضافة مادة</Button>} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => {
            const teacher = getTeacher(subject.teacherId)
            const grade = db.gradeLevels.find((g) => g.id === subject.gradeLevelId)
            const reels = db.reels.filter((r) => r.subjectId === subject.id)
            const exams = db.exams.filter((e) => e.subjectId === subject.id)
            const students = db.students.filter((s) => s.gradeLevelId === subject.gradeLevelId)
            return (
              <Card key={subject.id} className="card-hover overflow-hidden">
                <div className="h-1.5" style={{ background: subject.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <SubjectIcon subject={subject} className="size-12" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{subject.name}</h3>
                        <p className="mt-0.5 text-[10px] text-slate-400">{grade?.name}</p>
                      </div>
                    </div>
                    <Badge tone="slate">{formatNumber(students.length)} طالب</Badge>
                  </div>

                  {teacher && (
                    <Link to={`/app/teachers/${teacher.id}`} className="mt-4 flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:bg-slate-50">
                      <Avatar name={teacher.name} color={teacher.avatarColor} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-slate-800">{teacher.name}</p>
                        <p className="text-[9px] text-slate-400">معلم المادة • خبرة {teacher.experienceYears} سنة</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600">★ {teacher.rating}</span>
                    </Link>
                  )}

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center">
                    <div><p className="text-xs font-extrabold text-slate-800">{reels.length}</p><p className="text-[9px] text-slate-400">ريل</p></div>
                    <div className="border-x border-slate-200"><p className="text-xs font-extrabold text-slate-800">{exams.length}</p><p className="text-[9px] text-slate-400">امتحان</p></div>
                    <div><p className="text-xs font-extrabold text-slate-800">{exams.reduce((sum, e) => sum + e.attempts, 0)}</p><p className="text-[9px] text-slate-400">تسليم</p></div>
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    <Link to="/app/reels" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-[10px] font-bold text-white transition hover:bg-slate-800"><Clapperboard className="size-3.5" /> الريلز</Link>
                    <Link to="/app/exams" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"><BookOpen className="size-3.5" /> الامتحانات</Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="إضافة مادة دراسية"
        description="حدّد اسم المادة والمعلم المسؤول عنها والمستوى الدراسي."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button><Button onClick={submit}><Plus className="size-4" /> إضافة المادة</Button></>}
      >
        <div className="space-y-4">
          <Field label="اسم المادة">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: الجيولوجيا" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="المعلم المسؤول">
              <select className="select" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="المستوى الدراسي">
              <select className="select" value={gradeLevelId} onChange={(e) => setGradeLevelId(e.target.value)}>
                {db.gradeLevels.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
          </div>
          <div>
            <p className="label">لون المادة</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={cn('size-8 rounded-full border-2 transition', color === c ? 'border-slate-900 scale-110' : 'border-transparent')} style={{ background: c }} aria-label={`لون ${c}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[10px] text-slate-500">
            <SubjectIcon subject={{ id: 'preview', name: name || 'المادة', icon: 'BookOpen', color, gradeLevelId, schoolId: '', teacherId }} className="size-8" />
            معاينة سريعة لأيقونة المادة
          </div>
        </div>
      </Modal>
    </div>
  )
}
