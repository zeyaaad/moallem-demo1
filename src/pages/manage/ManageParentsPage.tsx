import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Edit3, Mail, Phone, Plus, Search, Trash2, UserCog, UserPlus, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Parent } from '../../types'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, SearchInput, StatCard, useToast,
} from '../../components/ui'
import { formatNumber } from '../../lib/utils'

interface ParentForm {
  name: string
  email: string
  phone: string
  job: string
}

const emptyForm: ParentForm = { name: '', email: '', phone: '', job: '' }

export default function ManageParentsPage() {
  const { db, getStudent, addParent, updateParent, deleteParent, notify } = useStore()
  const { push } = useToast()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Parent | null>(null)
  const [toDelete, setToDelete] = useState<Parent | null>(null)

  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(null)
      setFormOpen(true)
      params.delete('new')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const parents = useMemo(
    () => db.parents.filter((p) => !q || p.name.includes(q) || p.email.includes(q) || p.phone.includes(q) || p.job.includes(q)),
    [db.parents, q],
  )

  const linkedStudents = db.parents.reduce((sum, p) => sum + p.studentIds.length, 0)
  const noChildren = db.parents.filter((p) => p.studentIds.length === 0).length

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (parent: Parent) => { setEditing(parent); setFormOpen(true) }

  return (
    <div>
      <PageHeader
        title="أولياء الأمور"
        subtitle="أضف أولياء الأمور واربطهم بأبنائهم لمتابعة الدرجات والحضور لحظة بلحظة."
        actions={<Button onClick={openNew}><UserPlus className="size-4" /> إضافة ولي أمر</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي أولياء الأمور" value={db.parents.length} icon={Users} tone="brand" />
        <StatCard label="حسابات مرتبطة" value={linkedStudents} icon={UserCog} tone="emerald" hint="طالب مرتبط بولي أمر" />
        <StatCard label="بدون أبناء" value={noChildren} icon={UserPlus} tone="amber" hint="تحتاج ربطًا" />
        <StatCard label="متوسط الأبناء" value={(linkedStudents / Math.max(1, db.parents.length)).toFixed(1)} icon={Users} tone="sky" hint="لكل ولي أمر" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث بالاسم أو البريد أو الوظيفة…" className="w-full sm:w-80" />
        <span className="text-[11px] text-slate-400 sm:ms-auto">يتم إنشاء الحساب فور الإضافة ويمكن لولي الأمر تسجيل الدخول.</span>
      </Card>

      {parents.length === 0 ? (
        <Card><EmptyState icon={Search} title="لا يوجد أولياء أمور مطابقون" description="جرّب بحثًا آخر أو أضف ولي أمر جديدًا." action={<Button onClick={openNew}><Plus className="size-4" /> إضافة ولي أمر</Button>} /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-3">ولي الأمر</th>
                  <th className="px-3 py-3">الوظيفة</th>
                  <th className="px-3 py-3">بيانات التواصل</th>
                  <th className="px-3 py-3">الأبناء</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => (
                  <tr key={parent.id} className="transition hover:bg-slate-50/70">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={parent.name} color={parent.avatarColor} size="xs" />
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{parent.name}</p>
                          <p className="text-[9px] text-slate-400">{parent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-[11px] text-slate-500">{parent.job || '—'}</td>
                    <td className="table-cell">
                      <div className="space-y-0.5 text-[10px] text-slate-500">
                        <p className="flex items-center gap-1"><Phone className="size-2.5" /> <span dir="ltr">{parent.phone}</span></p>
                        <p className="flex items-center gap-1"><Mail className="size-2.5" /> {parent.email}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {parent.studentIds.map((sid) => {
                          const student = getStudent(sid)
                          return student
                            ? <span key={sid} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{student.name.split(' ')[0]} — {student.average}%</span>
                            : null
                        })}
                        {parent.studentIds.length === 0 && <Badge tone="amber">غير مرتبط</Badge>}
                      </div>
                    </td>
                    <td className="table-cell"><Badge tone={parent.status === 'active' ? 'emerald' : 'rose'} dot>{parent.status === 'active' ? 'نشط' : 'موقوف'}</Badge></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(parent)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600" aria-label="تعديل"><Edit3 className="size-3.5" /></button>
                        <button onClick={() => setToDelete(parent)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label="حذف"><Trash2 className="size-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {db.parents.slice(0, 3).map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center gap-2.5">
              <Avatar name={p.name} color={p.avatarColor} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-slate-800">{p.name}</p>
                <p className="text-[10px] text-slate-400">{p.studentIds.length} أبناء • {formatNumber(p.studentIds.length * 1200)} نقطة</p>
              </div>
            </div>
            <p className="mt-2.5 text-[10px] leading-5 text-slate-500">آخر دخول: اليوم — يتفاعل مع تقارير الأبناء أسبوعيًا.</p>
          </Card>
        ))}
      </div>

      {formOpen && (
        <ParentFormModal
          parent={editing}
          onClose={() => setFormOpen(false)}
          onSubmit={(data) => {
            if (editing) {
              updateParent(editing.id, data)
              notify('حدّث بيانات ولي أمر', data.name)
              push({ title: 'تم تحديث بيانات ولي الأمر', tone: 'success' })
            } else {
              addParent(data)
              notify('أضاف ولي أمر جديدًا', data.name)
              push({ title: 'تم إضافة ولي الأمر', body: 'يمكنه الآن تسجيل الدخول ومتابعة أبنائه.', tone: 'success' })
            }
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="حذف حساب ولي الأمر"
        description="سيتم إلغاء وصول ولي الأمر للمنصة. لن يتم حذف حسابات أبنائه."
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setToDelete(null)}>إلغاء</Button><Button variant="danger" onClick={() => { if (toDelete) { deleteParent(toDelete.id); notify('حذف حساب ولي أمر', toDelete.name); push({ title: 'تم حذف ولي الأمر', tone: 'success' }) } setToDelete(null) }}>حذف نهائي</Button></>}
      >
        <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-3">
          {toDelete && <Avatar name={toDelete.name} color={toDelete.avatarColor} size="sm" />}
          <p className="text-xs font-bold text-rose-700">{toDelete?.name}</p>
        </div>
      </Modal>
    </div>
  )
}

function ParentFormModal({ parent, onClose, onSubmit }: { parent: Parent | null; onClose: () => void; onSubmit: (data: ParentForm) => void }) {
  const { push } = useToast()
  const [form, setForm] = useState<ParentForm>(() => parent
    ? { name: parent.name, email: parent.email, phone: parent.phone, job: parent.job }
    : emptyForm)

  const submit = () => {
    if (!form.name.trim()) { push({ title: 'اكتب اسم ولي الأمر', tone: 'error' }); return }
    onSubmit({ ...form, email: form.email || `parent${Date.now()}@mail.com`, phone: form.phone || '0100 000 0000', job: form.job || 'ولي أمر' })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={parent ? 'تعديل بيانات ولي الأمر' : 'إضافة ولي أمر جديد'}
      description="سيتم إنشاء حساب لولي الأمر، ويمكن ربطه بالطلاب من صفحة الطالب."
      size="md"
      footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit}><UserCog className="size-4" /> {parent ? 'حفظ التعديلات' : 'إضافة ولي الأمر'}</Button></>}
    >
      <div className="space-y-4">
        <Field label="الاسم الكامل">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: أحمد عبد الله" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="البريد الإلكتروني">
            <input className="input" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="parent@mail.com" />
          </Field>
          <Field label="رقم الهاتف">
            <input className="input" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0100 000 0000" />
          </Field>
        </div>
        <Field label="الوظيفة">
          <input className="input" value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })} placeholder="مثال: مهندس برمجيات" />
        </Field>
        {parent && parent.studentIds.length > 0 && (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-[11px] font-bold text-slate-600">الأبناء المرتبطون حاليًا</p>
            <div className="flex flex-wrap gap-1.5">
              {parent.studentIds.map((sid) => <Badge key={sid} tone="brand">{sid}</Badge>)}
            </div>
          </div>
        )}
        <div className="rounded-xl bg-amber-50 p-3 text-[10px] leading-5 text-amber-800">
          ربط الطلاب يتم من صفحة الطالب. تأكد من تطابق البريد الإلكتروني مع بيانات المدرسة.
        </div>
      </div>
    </Modal>
  )
}
