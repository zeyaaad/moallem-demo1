import { useMemo, useState } from 'react'
import {
  Bell, CheckCircle2, GraduationCap, Megaphone, Pin, Plus, Search, Send, Sparkles, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import {
  Badge, Button, Card, EmptyState, Field, Modal, PageHeader, SearchInput, StatCard, useToast,
} from '../../components/ui'
import { cn, formatDate, relativeDay } from '../../lib/utils'

const audiences = ['الجميع', 'الطلاب', 'المعلمون', 'أولياء الأمور']

export default function AnnouncementsPage() {
  const { school, db, currentUser, addAnnouncement, notify } = useStore()
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('الجميع')

  const announcements = useMemo(
    () => db.announcements
      .filter((a) => !school || a.schoolId === school.id)
      .filter((a) => !q || a.title.includes(q) || a.body.includes(q) || a.authorName.includes(q)),
    [db.announcements, q, school],
  )

  const classAudiences = useMemo(
    () => db.classes.filter((c) => !school || c.schoolId === school.id).map((c) => c.name),
    [db.classes, school],
  )

  const totalAudience = db.students.length + db.teachers.length + db.parents.length

  const submit = () => {
    if (!title.trim()) { push({ title: 'اكتب عنوان الإعلان', tone: 'error' }); return }
    if (!body.trim()) { push({ title: 'اكتب نص الإعلان', tone: 'error' }); return }
    addAnnouncement({ title: title.trim(), body: body.trim(), audience })
    notify('نشر إعلانًا جديدًا', `${title} — ${audience}`)
    push({ title: 'تم نشر الإعلان', body: 'تم إرسال إشعار للمخاطبين.', tone: 'success' })
    setTitle('')
    setBody('')
    setAudience('الجميع')
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="الإعلانات"
        subtitle="أرسل تعميمات مهمة للطلاب والمعلمين وأولياء الأمور، وتابع كل ما نُشر في مدرستك."
        actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> إعلان جديد</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي الإعلانات" value={announcements.length} icon={Megaphone} tone="brand" hint="هذا الفصل" />
        <StatCard label="الجمهور الكلي" value={totalAudience} icon={Users} tone="sky" hint="طالب ومعلم وولي أمر" />
        <StatCard label="إعلانات مثبتة" value={announcements.filter((a) => a.audience === 'الجميع').length} icon={Pin} tone="amber" hint="تظهر للجميع" />
        <StatCard label="آخر إعلان" value={announcements[0] ? relativeDay(announcements[0].date) : '—'} icon={Bell} tone="emerald" hint="نشر تلقائي" />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={q} onChange={setQ} placeholder="ابحث في الإعلانات…" className="w-full sm:w-80" />
        <Badge tone="violet" className="sm:ms-auto"><Sparkles className="size-3" /> كل إعلان يرسل إشعارًا فوريًا</Badge>
      </Card>

      {announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Megaphone}
            title="لا توجد إعلانات بعد"
            description="ابدأ بنشر أول إعلان لأولياء الأمور أو المعلمين."
            action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> إعلان جديد</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {announcements.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Megaphone className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">{item.title}</h2>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {item.authorName} • {formatDate(item.date)} • {relativeDay(item.date)}
                      </p>
                    </div>
                  </div>
                  <Badge tone={item.audience === 'الجميع' ? 'brand' : 'slate'}>{item.audience}</Badge>
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-600">{item.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-50 pt-3 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><CheckCircle2 className="size-3.5 text-emerald-500" /> تم الإرسال</span>
                  <span className="flex items-center gap-1"><Bell className="size-3.5" /> إشعار داخل المنصة</span>
                  <span className="flex items-center gap-1"><Users className="size-3.5" /> {db.notifications.length} إشعار</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-extrabold text-slate-900">قنوات النشر</h2>
              <div className="space-y-2.5">
                {[
                  { icon: Users, label: 'جميع المستخدمين', value: totalAudience, tone: 'brand' },
                  { icon: GraduationCap, label: 'الطلاب', value: db.students.length, tone: 'emerald' },
                  { icon: Users, label: 'أولياء الأمور', value: db.parents.length, tone: 'amber' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5">
                    <span className={cn('flex size-8 items-center justify-center rounded-lg', row.tone === 'brand' ? 'bg-brand-50 text-brand-600' : row.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                      <row.icon className="size-4" />
                    </span>
                    <span className="flex-1 text-[11px] font-bold text-slate-700">{row.label}</span>
                    <span className="text-[11px] font-extrabold text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
                يتم إرسال الإعلانات كإشعارات فورية داخل لوحة التحكم، وتظهر حسب الجمهور المحدد.
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-sm font-extrabold text-slate-900">أكثر الفصول تفاعلًا</h2>
              <div className="space-y-2">
                {db.classes.slice(0, 4).map((cls) => (
                  <div key={cls.id} className="flex items-center gap-2">
                    <span className="w-14 text-[11px] font-bold text-slate-600">{cls.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${45 + (cls.studentsCount % 6) * 8}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{cls.studentsCount} طالب</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="إعلان جديد"
        description="سيصل الإعلان كإشعار فوري لكل من يختاره الجمهور المستهدف."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button><Button onClick={submit}><Send className="size-4" /> نشر الإعلان</Button></>}
      >
        <div className="space-y-4">
          <Field label="عنوان الإعلان">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: بدء مراجعات منتصف الفصل" />
          </Field>
          <Field label="نص الإعلان">
            <textarea className="textarea min-h-28" value={body} onChange={(e) => setBody(e.target.value)} placeholder="اكتب التفاصيل التي تريد إيصالها…" />
          </Field>
          <div>
            <p className="label">الجمهور المستهدف</p>
            <div className="flex flex-wrap gap-1.5">
              {audiences.map((a) => (
                <button key={a} type="button" onClick={() => setAudience(a)} className={cn('chip', audience === a && 'chip-active')}>
                  {a}
                </button>
              ))}
              {classAudiences.map((name) => (
                <button key={name} type="button" onClick={() => setAudience(name)} className={cn('chip', audience === name && 'chip-active')}>
                  فصل {name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-brand-50/70 p-3 text-[10px] leading-5 text-brand-800">
            <Search className="mt-0.5 size-3.5 shrink-0" />
            سيتم تسجيل الإعلان في سجل النشاط باسم {currentUser?.name}، وإمكانية الرجوع إليه من هذه الصفحة.
          </div>
        </div>
      </Modal>
    </div>
  )
}
