import { useMemo, useState } from 'react'
import {
  ArrowLeft, DoorOpen, GraduationCap, Layers, Plus, School, UserCog, Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../lib/store'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, ProgressBar, StatCard, useToast,
} from '../../components/ui'
import { cn } from '../../lib/utils'

export default function ManageClassesPage() {
  const { db, addClass, addGradeLevel, notify } = useStore()
  const { push } = useToast()
  const [classOpen, setClassOpen] = useState(false)
  const [gradeOpen, setGradeOpen] = useState(false)

  const [name, setName] = useState('')
  const [gradeLevelId, setGradeLevelId] = useState(db.gradeLevels[0]?.id ?? '')
  const [room, setRoom] = useState('')
  const [supervisorId, setSupervisorId] = useState(db.teachers[0]?.id ?? '')
  const [gradeName, setGradeName] = useState('')

  const totalStudents = db.students.length
  const avgSize = Math.round(totalStudents / Math.max(1, db.classes.length))
  const levelStats = useMemo(
    () => db.gradeLevels.map((g) => ({
      ...g,
      classes: db.classes.filter((c) => c.gradeLevelId === g.id),
      students: db.students.filter((s) => s.gradeLevelId === g.id),
    })),
    [db.classes, db.gradeLevels, db.students],
  )

  const submitClass = () => {
    if (!name.trim()) { push({ title: 'اكتب اسم الفصل', tone: 'error' }); return }
    if (!gradeLevelId) { push({ title: 'اختر المستوى الدراسي', tone: 'error' }); return }
    addClass({ name: name.trim(), gradeLevelId, room: room || '—', supervisorId })
    notify('أنشأ فصلًا جديدًا', `${name} — ${db.gradeLevels.find((g) => g.id === gradeLevelId)?.name}`)
    push({ title: 'تم إنشاء الفصل', body: 'يمكنك الآن إضافة الطلاب إليه.', tone: 'success' })
    setName('')
    setRoom('')
    setClassOpen(false)
  }

  const submitGrade = () => {
    if (!gradeName.trim()) { push({ title: 'اكتب اسم المستوى', tone: 'error' }); return }
    addGradeLevel(gradeName.trim())
    notify('أضاف مستوى دراسيًا', gradeName)
    push({ title: 'تم إضافة المستوى الدراسي', tone: 'success' })
    setGradeName('')
    setGradeOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="الفصول والمستويات"
        subtitle="نظّم المدرسة في مستويات وفصول، ووزّع الطلاب والمعلمين بسهولة."
        actions={
          <>
            <Button variant="secondary" onClick={() => setGradeOpen(true)}><Layers className="size-4" /> مستوى جديد</Button>
            <Button onClick={() => setClassOpen(true)}><Plus className="size-4" /> فصل جديد</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="المستويات" value={db.gradeLevels.length} icon={Layers} tone="brand" />
        <StatCard label="الفصول" value={db.classes.length} icon={School} tone="sky" hint={`${avgSize} طالب/فصل`} />
        <StatCard label="الطلاب" value={totalStudents} icon={Users} tone="emerald" />
        <StatCard label="معلمو الفصول" value={new Set(db.classes.map((c) => c.supervisorId)).size} icon={UserCog} tone="amber" />
      </div>

      {db.gradeLevels.length === 0 ? (
        <Card><EmptyState icon={Layers} title="لا توجد مستويات بعد" description="ابدأ بإضافة مستوى دراسي ثم أنشئ الفصول." action={<Button onClick={() => setGradeOpen(true)}><Plus className="size-4" /> مستوى جديد</Button>} /></Card>
      ) : (
        <div className="space-y-6">
          {levelStats.map((level) => (
            <section key={level.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><GraduationCap className="size-4" /></span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">{level.name}</h2>
                    <p className="text-[10px] text-slate-400">{level.classes.length} فصول • {level.students.length} طالب</p>
                  </div>
                </div>
                <Button size="sm" variant="soft" onClick={() => { setGradeLevelId(level.id); setClassOpen(true) }}><Plus className="size-3.5" /> فصل في هذا المستوى</Button>
              </div>

              {level.classes.length === 0 ? (
                <Card className="border-dashed"><EmptyState icon={School} title="لا توجد فصول في هذا المستوى" description="أضف فصلًا جديدًا لتبدأ توزيع الطلاب." /></Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {level.classes.map((cls) => {
                    const students = db.students.filter((s) => s.classId === cls.id)
                    const supervisor = db.teachers.find((t) => t.id === cls.supervisorId)
                    const avg = Math.round(students.reduce((sum, s) => sum + s.average, 0) / Math.max(1, students.length))
                    return (
                      <Card key={cls.id} className="card-hover p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">{cls.name}</span>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">فصل {cls.name}</p>
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400"><DoorOpen className="size-3" /> قاعة {cls.room}</p>
                            </div>
                          </div>
                          <Badge tone="brand">{students.length} طالب</Badge>
                        </div>

                        <div className="mt-3 rounded-xl bg-slate-50 p-2.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-500">متوسط الأداء</span>
                            <span className={cn('font-extrabold', avg >= 80 ? 'text-emerald-600' : avg >= 60 ? 'text-amber-600' : 'text-rose-600')}>{avg}%</span>
                          </div>
                          <ProgressBar value={avg} size="sm" className="mt-1.5" tone={avg >= 80 ? 'emerald' : avg >= 60 ? 'amber' : 'rose'} />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {supervisor ? (
                              <>
                                <Avatar name={supervisor.name} color={supervisor.avatarColor} size="xs" />
                                <div>
                                  <p className="text-[10px] font-bold text-slate-700">{supervisor.name}</p>
                                  <p className="text-[9px] text-slate-400">المشرف</p>
                                </div>
                              </>
                            ) : <span className="text-[10px] text-slate-400">لا يوجد مشرف</span>}
                          </div>
                          <Link to={`/app/students?new=1`} className="flex items-center gap-1 text-[10px] font-bold text-brand-600">الطلاب <ArrowLeft className="size-3" /></Link>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <Modal
        open={classOpen}
        onClose={() => setClassOpen(false)}
        title="إنشاء فصل جديد"
        description="اختر المستوى الدراسي والمشرف، وحدد اسم الفصل والقاعة."
        footer={<><Button variant="secondary" onClick={() => setClassOpen(false)}>إلغاء</Button><Button onClick={submitClass}><Plus className="size-4" /> إنشاء الفصل</Button></>}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم الفصل" hint="مثال: ٢ / أ">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="٢ / أ" />
            </Field>
            <Field label="القاعة">
              <input className="input" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="B-201" dir="ltr" />
            </Field>
          </div>
          <Field label="المستوى الدراسي">
            <select className="select" value={gradeLevelId} onChange={(e) => setGradeLevelId(e.target.value)}>
              {db.gradeLevels.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label="المشرف على الفصل">
            <select className="select" value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
              {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <div className="rounded-xl bg-brand-50/70 p-3 text-[10px] leading-5 text-brand-800">
            بعد إنشاء الفصل يمكنك إضافة الطلاب من صفحة «الطلاب» واختيار الفصل الجديد.
          </div>
        </div>
      </Modal>

      <Modal
        open={gradeOpen}
        onClose={() => setGradeOpen(false)}
        title="إضافة مستوى دراسي"
        description="أضف صفًا دراسيًا جديدًا لتنظيم الفصول تحته."
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setGradeOpen(false)}>إلغاء</Button><Button onClick={submitGrade}><Layers className="size-4" /> إضافة</Button></>}
      >
        <Field label="اسم المستوى">
          <input className="input" value={gradeName} onChange={(e) => setGradeName(e.target.value)} placeholder="مثال: الصف الأول الثانوي" />
        </Field>
      </Modal>
    </div>
  )
}
