import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, GraduationCap, Plus, TrendingUp, Trophy, UserPlus, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { Student } from '../../types'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, ProgressBar, SearchInput, StatCard, useToast,
} from '../../components/ui'
import { cn, formatNumber } from '../../lib/utils'

export default function StudentsPage() {
  const { currentUser, db, addStudent, getClass, getGrade, getParent, notify } = useStore()
  const { push } = useToast()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)

  const isManager = currentUser?.role === 'manager'
  const isTeacher = currentUser?.role === 'teacher'
  const teacher = isTeacher ? db.teachers.find((t) => t.id === currentUser?.id) : undefined
  const myClasses = teacher ? db.classes.filter((c) => teacher.classIds.includes(c.id)) : db.classes

  useEffect(() => {
    if (params.get('new') === '1') {
      setAddOpen(true)
      params.delete('new')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const students = useMemo(() => {
    const base = isTeacher ? db.students.filter((s) => teacher?.classIds.includes(s.classId)) : db.students
    return base
      .filter((s) => classFilter === 'all' || s.classId === classFilter)
      .filter((s) => !q || s.name.includes(q) || s.code.includes(q) || s.email.includes(q))
  }, [db.students, isTeacher, teacher, classFilter, q])

  const avg = Math.round(students.reduce((sum, s) => sum + s.average, 0) / Math.max(1, students.length))
  const top = [...students].sort((a, b) => b.average - a.average)[0]
  const atRisk = students.filter((s) => s.average < 65)

  return (
    <div>
      <PageHeader
        title={isTeacher ? 'طلابي' : 'الطلاب'}
        subtitle={isTeacher ? 'كل طلاب فصولك، مع مستواهم وبيانات التواصل.' : 'أضف الطلاب، وزّعهم على الفصول، وتابع أداءهم في مكان واحد.'}
        actions={
          isManager ? (
            <Button onClick={() => setAddOpen(true)}><UserPlus className="size-4" /> إضافة طالب</Button>
          ) : (
            <Badge tone="brand">{students.length} طالب</Badge>
          )
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي الطلاب" value={students.length} icon={Users} tone="brand" hint={`${myClasses.length} فصول`} />
        <StatCard label="متوسط الأداء" value={`${avg}%`} icon={TrendingUp} tone="emerald" delta="+٣٪" hint="هذا الشهر" />
        <StatCard label="الطالب الأول" value={top?.name.split(' ')[0] ?? '—'} icon={Trophy} tone="amber" hint={top ? `${top.average}%` : ''} />
        <StatCard label="يحتاجون دعمًا" value={atRisk.length} icon={GraduationCap} tone="rose" hint="متوسط أقل من ٦٥٪" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث بالاسم أو الكود…" className="w-full sm:w-64" />
        <select className="select h-10.5 w-full sm:ms-auto sm:w-44" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="all">كل الفصول</option>
          {myClasses.map((c) => <option key={c.id} value={c.id}>فصل {c.name}</option>)}
        </select>
        {isManager && (
          <Link to="/app/attendance" className="text-[11px] font-bold text-brand-600">رصد الحضور ←</Link>
        )}
      </Card>

      {students.length === 0 ? (
        <Card><EmptyState icon={Users} title="لا يوجد طلاب مطابقون" description="جرّب تغيير الفلتر أو أضف طالبًا جديدًا." action={isManager ? <Button onClick={() => setAddOpen(true)}><Plus className="size-4" /> إضافة طالب</Button> : undefined} /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-3">الطالب</th>
                  <th className="px-3 py-3">الفصل</th>
                  <th className="px-3 py-3">المستوى</th>
                  <th className="px-3 py-3">المتوسط</th>
                  <th className="px-3 py-3">الحضور</th>
                  <th className="px-3 py-3">ولي الأمر</th>
                  <th className="px-3 py-3">النقاط</th>
                  <th className="px-5 py-3">الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50/70">
                    <td className="table-cell">
                      <Link to={`/app/students/${s.id}`} className="flex items-center gap-2.5">
                        <Avatar name={s.name} color={s.avatarColor} size="xs" />
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{s.name}</p>
                          <p className="text-[9px] text-slate-400">{s.code} • {s.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="table-cell text-[11px] text-slate-500">{getClass(s.classId)?.name}</td>
                    <td className="table-cell text-[11px] text-slate-500">{getGrade(s.gradeLevelId)?.name.replace('الصف ', '')}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-[11px] font-extrabold text-slate-700">{s.average}٪</span>
                        <ProgressBar value={s.average} size="sm" className="w-16" tone={s.average >= 80 ? 'emerald' : s.average >= 65 ? 'amber' : 'rose'} />
                      </div>
                    </td>
                    <td className="table-cell text-[11px] text-slate-500">{s.attendanceRate}٪</td>
                    <td className="table-cell text-[11px] text-slate-500">{getParent(s.parentId)?.name ?? '—'}</td>
                    <td className="table-cell text-[11px] font-bold text-slate-600">{formatNumber(s.points)}</td>
                    <td className="table-cell">
                      <Badge tone={s.average >= 85 ? 'emerald' : s.average >= 65 ? 'brand' : 'rose'} dot>
                        {s.average >= 85 ? 'متميز' : s.average >= 65 ? 'منتظم' : 'يحتاج دعمًا'}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      <Link to={`/app/students/${s.id}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600">
                        الملف <ArrowLeft className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isManager && (
        <AddStudentModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={(data) => {
            addStudent(data)
            notify('أضاف طالبًا جديدًا', data.name)
            push({ title: 'تم إضافة الطالب بنجاح', body: 'يمكنه الآن تسجيل الدخول ومتابعة دروسه.', tone: 'success' })
            setAddOpen(false)
          }}
        />
      )}

      <div className={cn('mt-4 flex items-center gap-2 rounded-2xl border p-4 text-[11px]', atRisk.length ? 'border-amber-100 bg-amber-50/60 text-amber-800' : 'border-emerald-100 bg-emerald-50/60 text-emerald-800')}>
        <CheckCircle2 className="size-4 shrink-0" />
        {atRisk.length
          ? `${atRisk.length} طالبًا يحتاجون متابعة — راجع صفحة النتائج لمعرفة نقاط الضعف.`
          : 'كل الطلاب في مستوى جيد — استمر في المتابعة الأسبوعية.'}
      </div>
    </div>
  )
}

function AddStudentModal({ open, onClose, onSubmit }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; phone: string; classId: string; parentId: string }) => void
}) {
  const { db } = useStore()
  const { push } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [classId, setClassId] = useState(db.classes[0]?.id ?? '')
  const [parentId, setParentId] = useState(db.parents[0]?.id ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { push({ title: 'اكتب اسم الطالب', tone: 'error' }); return }
    onSubmit({
      name, email: email || `student${Date.now()}@alnoor.edu.eg`, phone: phone || '0100 000 0000', classId, parentId,
    })
    setName(''); setEmail(''); setPhone('')
  }

  const selectedClass = db.classes.find((c) => c.id === classId)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إضافة طالب جديد"
      description="سيتم إنشاء حساب للطالب وإضافته إلى الفصل المحدد."
      footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit}><UserPlus className="size-4" /> إضافة الطالب</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم الكامل">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: عمر أحمد" />
          </Field>
          <Field label="رقم الهاتف">
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0100 000 0000" dir="ltr" />
          </Field>
        </div>
        <Field label="البريد الإلكتروني">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@alnoor.edu.eg" dir="ltr" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الفصل" hint={selectedClass ? `المستوى: ${db.gradeLevels.find((g) => g.id === selectedClass.gradeLevelId)?.name}` : undefined}>
            <select className="select" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="ولي الأمر">
            <select className="select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              {db.parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="rounded-xl bg-brand-50/70 p-3 text-[10px] leading-5 text-brand-800">
          سيتم إرسال بيانات الدخول إلى البريد الإلكتروني، ويمكن للطالب تغيير كلمة المرور من الإعدادات.
        </div>
      </form>
    </Modal>
  )
}

export type { Student }
