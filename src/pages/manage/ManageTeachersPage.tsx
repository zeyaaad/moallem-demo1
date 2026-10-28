import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Edit3, GraduationCap, Mail, Plus, Search, Star, Trash2, UserCog, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Teacher } from '../../types'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, SearchInput, StatCard, useToast,
} from '../../components/ui'
import { cn, formatNumber } from '../../lib/utils'

interface TeacherForm {
  name: string
  email: string
  phone: string
  subjectIds: string[]
  classIds: string[]
  experienceYears: number
}

const emptyForm: TeacherForm = { name: '', email: '', phone: '', subjectIds: [], classIds: [], experienceYears: 3 }

export default function ManageTeachersPage() {
  const { db, addTeacher, updateTeacher, deleteTeacher, notify } = useStore()
  const { push } = useToast()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [subject, setSubject] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [toDelete, setToDelete] = useState<Teacher | null>(null)

  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(null)
      setFormOpen(true)
      params.delete('new')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const teachers = useMemo(
    () => db.teachers
      .filter((t) => subject === 'all' || t.subjectIds.includes(subject))
      .filter((t) => !q || t.name.includes(q) || t.email.includes(q) || t.phone.includes(q)),
    [db.teachers, q, subject],
  )

  const totalStudents = db.teachers.reduce((sum, t) => sum + t.studentsCount, 0)
  const avgRating = (db.teachers.reduce((sum, t) => sum + t.rating, 0) / Math.max(1, db.teachers.length)).toFixed(1)

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (teacher: Teacher) => { setEditing(teacher); setFormOpen(true) }

  return (
    <div>
      <PageHeader
        title="إدارة المعلمين"
        subtitle="أضف المعلمين، حدّد موادهم وفصولهم، وتابع أداءهم داخل المدرسة."
        actions={<Button onClick={openNew}><Plus className="size-4" /> إضافة معلم</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي المعلمين" value={db.teachers.length} icon={GraduationCap} tone="brand" hint={`${db.subjects.length} مادة`} />
        <StatCard label="إجمالي الطلاب" value={formatNumber(totalStudents)} icon={Users} tone="sky" hint="موزعون على الفصول" />
        <StatCard label="متوسط التقييم" value={`${avgRating} ★`} icon={Star} tone="amber" hint="من الطلاب" />
        <StatCard label="فصول مغطاة" value={new Set(db.teachers.flatMap((t) => t.classIds)).size} icon={UserCog} tone="emerald" hint={`من ${db.classes.length} فصل`} />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث بالاسم أو البريد أو الهاتف…" className="w-full sm:w-72" />
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
        <Card><EmptyState icon={Search} title="لا يوجد معلمون مطابقون" description="جرّب تعديل البحث أو أضف معلمًا جديدًا للمدرسة." action={<Button onClick={openNew}><Plus className="size-4" /> إضافة معلم</Button>} /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-3">المعلم</th>
                  <th className="px-3 py-3">المواد</th>
                  <th className="px-3 py-3">الفصول</th>
                  <th className="px-3 py-3">الخبرة</th>
                  <th className="px-3 py-3">الطلاب</th>
                  <th className="px-3 py-3">التقييم</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="transition hover:bg-slate-50/70">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={teacher.name} color={teacher.avatarColor} size="xs" />
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{teacher.name}</p>
                          <p className="mt-0.5 flex items-center gap-2 text-[9px] text-slate-400">
                            <span className="flex items-center gap-0.5"><Mail className="size-2.5" /> {teacher.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjectIds.map((sid) => {
                          const subject = db.subjects.find((s) => s.id === sid)
                          return <span key={sid} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${subject?.color}18`, color: subject?.color }}>{subject?.name}</span>
                        })}
                      </div>
                    </td>
                    <td className="table-cell text-[11px] text-slate-500">{teacher.classIds.map((cid) => db.classes.find((c) => c.id === cid)?.name).filter(Boolean).join('، ') || '—'}</td>
                    <td className="table-cell text-[11px] text-slate-500">{teacher.experienceYears} سنة</td>
                    <td className="table-cell text-[11px] font-bold text-slate-600">{formatNumber(teacher.studentsCount)}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><Star className="size-3 fill-amber-400 text-amber-400" /> {teacher.rating}</span>
                    </td>
                    <td className="table-cell"><Badge tone={teacher.status === 'active' ? 'emerald' : 'rose'} dot>{teacher.status === 'active' ? 'نشط' : 'موقوف'}</Badge></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(teacher)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600" aria-label="تعديل"><Edit3 className="size-3.5" /></button>
                        <button onClick={() => setToDelete(teacher)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label="حذف"><Trash2 className="size-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-[11px] leading-6 text-brand-800">
        <GraduationCap className="size-4 shrink-0" />
        عند إضافة معلم جديد يتم إنشاء حساب له تلقائيًا، ويمكنه تسجيل الدخول للمنصة ببيانات البريد الإلكتروني.
      </div>

      {formOpen && (
        <TeacherFormModal
          teacher={editing}
          onClose={() => setFormOpen(false)}
          onSubmit={(data) => {
            if (editing) {
              updateTeacher(editing.id, data)
              notify('حدّث بيانات معلم', data.name)
              push({ title: 'تم تحديث بيانات المعلم', tone: 'success' })
            } else {
              addTeacher(data)
              notify('أضاف معلمًا جديدًا', data.name)
              push({ title: 'تم إضافة المعلم بنجاح', body: 'تم إنشاء الحساب وإرسال بيانات الدخول.', tone: 'success' })
            }
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="حذف حساب المعلم"
        description="سيتم حذف حساب المعلم وإزالته من الفصول. لا يمكن التراجع."
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setToDelete(null)}>إلغاء</Button><Button variant="danger" onClick={() => { if (toDelete) { deleteTeacher(toDelete.id); notify('حذف حساب معلم', toDelete.name); push({ title: 'تم حذف المعلم', tone: 'success' }) } setToDelete(null) }}>حذف نهائي</Button></>}
      >
        <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-3">
          {toDelete && <Avatar name={toDelete.name} color={toDelete.avatarColor} size="sm" />}
          <p className="text-xs font-bold text-rose-700">{toDelete?.name}</p>
        </div>
      </Modal>
    </div>
  )
}

function TeacherFormModal({ teacher, onClose, onSubmit }: { teacher: Teacher | null; onClose: () => void; onSubmit: (data: TeacherForm) => void }) {
  const { db } = useStore()
  const { push } = useToast()
  const [form, setForm] = useState<TeacherForm>(() => teacher
    ? { name: teacher.name, email: teacher.email, phone: teacher.phone, subjectIds: teacher.subjectIds, classIds: teacher.classIds, experienceYears: teacher.experienceYears }
    : emptyForm)

  const toggle = (key: 'subjectIds' | 'classIds', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((x) => x !== value) : [...prev[key], value],
    }))
  }

  const submit = () => {
    if (!form.name.trim()) { push({ title: 'اكتب اسم المعلم', tone: 'error' }); return }
    if (form.subjectIds.length === 0) { push({ title: 'اختر مادة واحدة على الأقل', tone: 'error' }); return }
    onSubmit({ ...form, email: form.email || `teacher${Date.now()}@alnoor.edu.eg`, phone: form.phone || '0100 000 0000' })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={teacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
      description="حدّد المواد والفصول التي يدرّسها المعلم، وسيتم ربطه بها فورًا."
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit}><UserCog className="size-4" /> {teacher ? 'حفظ التعديلات' : 'إضافة المعلم'}</Button></>}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم الكامل">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: أ. محمود سعيد" />
          </Field>
          <Field label="سنوات الخبرة">
            <input type="number" min={0} max={40} className="input" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="البريد الإلكتروني" hint="يُستخدم لتسجيل الدخول">
            <input className="input" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="teacher@alnoor.edu.eg" />
          </Field>
          <Field label="رقم الهاتف">
            <input className="input" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0100 000 0000" />
          </Field>
        </div>

        <div>
          <p className="label">المواد الدراسية</p>
          <div className="flex flex-wrap gap-1.5">
            {db.subjects.map((s) => (
              <button key={s.id} type="button" onClick={() => toggle('subjectIds', s.id)} className={cn('chip', form.subjectIds.includes(s.id) && 'chip-active')}>
                <span className="size-2 rounded-full" style={{ background: form.subjectIds.includes(s.id) ? '#fff' : s.color }} /> {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label">الفصول التي يدرّسها</p>
          <div className="flex flex-wrap gap-1.5">
            {db.classes.map((c) => (
              <button key={c.id} type="button" onClick={() => toggle('classIds', c.id)} className={cn('chip', form.classIds.includes(c.id) && 'chip-active')}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-brand-50/70 p-3 text-[10px] leading-5 text-brand-800">
          سيتم إنشاء حساب للمعلم وإرسال دعوة على البريد الإلكتروني. يمكنك تعديل المواد والفصول في أي وقت.
        </div>
      </div>
    </Modal>
  )
}
