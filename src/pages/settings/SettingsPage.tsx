import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Building2, CheckCircle2, KeyRound, Mail, RotateCcw, Save, ShieldCheck, SlidersHorizontal,
  Sparkles, UserRound, Users,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { roleMeta } from '../../components/AppLayout'
import {
  Avatar, Badge, Button, Card, Field, PageHeader, Switch, useToast,
} from '../../components/ui'
import { cn, formatDate } from '../../lib/utils'

type Tab = 'profile' | 'notifications' | 'institution' | 'demo'

export default function SettingsPage() {
  const { currentUser, school, db, updateSchool, updateStudent, updateTeacher, updateParent, resetDemo, notify } = useStore()
  const { push } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    phone: currentUser?.phone ?? '',
    bio: currentUser?.role === 'teacher' ? db.teachers.find((t) => t.id === currentUser.id)?.bio ?? '' : '',
  })
  const [schoolForm, setSchoolForm] = useState({
    name: school?.name ?? '',
    phone: school?.phone ?? '',
    email: school?.email ?? '',
    address: school?.address ?? '',
  })
  const [notifications, setNotifications] = useState({
    exams: true, grades: true, attendance: true, reels: false, weekly: true, system: true,
  })
  const [platform, setPlatform] = useState({
    aiExams: true, reels: true, parentApp: true, maintenance: false, publicLanding: true,
  })
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })

  if (!currentUser) return null
  const role = currentUser.role
  const isSuper = role === 'super_admin'
  const isManager = role === 'manager'

  const tabs: Array<{ id: Tab; label: string; icon: typeof UserRound }> = [
    { id: 'profile', label: 'الملف الشخصي', icon: UserRound },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    ...(isSuper || isManager ? [{ id: 'institution' as const, label: isSuper ? 'إعدادات المنصة' : 'إعدادات المدرسة', icon: Building2 }] : []),
    { id: 'demo', label: 'النسخة التجريبية', icon: Sparkles },
  ]

  const saveProfile = () => {
    if (!profile.name.trim()) { push({ title: 'اكتب الاسم', tone: 'error' }); return }
    if (role === 'student') updateStudent(currentUser.id, { name: profile.name, email: profile.email, phone: profile.phone })
    else if (role === 'teacher') updateTeacher(currentUser.id, { name: profile.name, email: profile.email, phone: profile.phone, bio: profile.bio })
    else if (role === 'parent') updateParent(currentUser.id, { name: profile.name, email: profile.email, phone: profile.phone })
    notify('حدّث الملف الشخصي', currentUser.name)
    push({ title: 'تم حفظ الملف الشخصي', tone: 'success' })
  }

  const saveSchool = () => {
    if (!school) return
    if (!schoolForm.name.trim()) { push({ title: 'اكتب اسم المدرسة', tone: 'error' }); return }
    updateSchool(school.id, schoolForm)
    notify('حدّث بيانات المدرسة', schoolForm.name)
    push({ title: 'تم حفظ بيانات المدرسة', tone: 'success' })
  }

  const changePassword = () => {
    if (!password.current) { push({ title: 'أدخل كلمة المرور الحالية', tone: 'error' }); return }
    if (password.next.length < 6) { push({ title: 'كلمة المرور الجديدة قصيرة', body: '٦ أحرف على الأقل.', tone: 'error' }); return }
    if (password.next !== password.confirm) { push({ title: 'كلمتا المرور غير متطابقتين', tone: 'error' }); return }
    setPassword({ current: '', next: '', confirm: '' })
    push({ title: 'تم تحديث كلمة المرور', body: 'استخدم كلمة المرور الجديدة في الدخول القادم.', tone: 'success' })
  }

  return (
    <div>
      <PageHeader
        title={isSuper ? 'إعدادات المنصة' : isManager ? 'إعدادات المدرسة' : 'الإعدادات'}
        subtitle="تحكم في حسابك، تفضيلات الإشعارات، وبيانات المؤسسة — كل شيء في مكان واحد."
      />

      <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1 scrollbar-hide">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition',
              tab === item.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            <item.icon className="size-4" /> {item.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 text-sm font-extrabold text-slate-900">البيانات الشخصية</h2>
            <div className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <Avatar name={profile.name || currentUser.name} color={currentUser.avatarColor} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">{profile.name || currentUser.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{roleMeta[role].label} • {isSuper ? 'منصة مُعلّم' : school?.name}</p>
                <Badge tone="emerald" className="mt-1.5" dot>حساب نشط</Badge>
              </div>
              <Button variant="secondary" size="sm" onClick={() => push({ title: 'رفع الصورة', body: 'ميزة رفع الصورة ستتوفر في النسخة النهائية.', tone: 'info' })}>
                تغيير الصورة
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم الكامل">
                <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </Field>
              <Field label="البريد الإلكتروني">
                <input className="input" dir="ltr" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </Field>
              <Field label="رقم الهاتف">
                <input className="input" dir="ltr" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </Field>
              <Field label="الدور">
                <input className="input bg-slate-50" value={roleMeta[role].label} readOnly />
              </Field>
            </div>

            {role === 'teacher' && (
              <Field label="نبذة عنك" className="mt-4">
                <textarea className="textarea min-h-24" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="اكتب نبذة قصيرة تظهر لطلابك…" />
              </Field>
            )}

            <div className="mt-5 flex justify-end">
              <Button onClick={saveProfile}><Save className="size-4" /> حفظ التغييرات</Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><KeyRound className="size-4 text-slate-400" /> كلمة المرور</h2>
              <div className="space-y-3">
                <Field label="كلمة المرور الحالية">
                  <input type="password" className="input" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} placeholder="••••••••" />
                </Field>
                <Field label="كلمة المرور الجديدة">
                  <input type="password" className="input" value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} placeholder="٦ أحرف على الأقل" />
                </Field>
                <Field label="تأكيد كلمة المرور">
                  <input type="password" className="input" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder="••••••••" />
                </Field>
                <Button variant="secondary" className="w-full" onClick={changePassword}>تحديث كلمة المرور</Button>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><ShieldCheck className="size-4 text-emerald-500" /> أمان الحساب</h2>
              <div className="space-y-2 text-[11px] text-slate-500">
                <p className="flex items-center justify-between"><span>التحقق بخطوتين</span><Badge tone="amber">قريبًا</Badge></p>
                <p className="flex items-center justify-between"><span>آخر دخول</span><b className="text-slate-700">اليوم</b></p>
                <p className="flex items-center justify-between"><span>تاريخ الإنشاء</span><b className="text-slate-700">{formatDate(currentUser.createdAt)}</b></p>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-2 text-sm font-extrabold text-slate-900">حسابك</h2>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <p className="flex items-center gap-2"><Mail className="size-3.5" /> {currentUser.email}</p>
                <p className="flex items-center gap-2"><Users className="size-3.5" /> {isSuper ? `${db.schools.length} مدارس` : `${db.students.length} طالب في المدرسة`}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">تفضيلات الإشعارات</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">اختر ما تريد أن تصلك تنبيهاته</p>
              </div>
              <Button size="sm" onClick={() => { notify('حدّث تفضيلات الإشعارات'); push({ title: 'تم حفظ التفضيلات', tone: 'success' }) }}>
                <Save className="size-3.5" /> حفظ
              </Button>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { key: 'exams' as const, title: 'الامتحانات', desc: 'امتحان جديد، اقتراب الموعد، أو نتيجة جاهزة.' },
                { key: 'grades' as const, title: 'الدرجات والتقارير', desc: 'تحديث المتوسط أو تقرير أداء جديد.' },
                { key: 'attendance' as const, title: 'الحضور والغياب', desc: 'تسجيل غياب أو تأخر أو ملاحظة سلوك.' },
                { key: 'reels' as const, title: 'الريلز التعليمية', desc: 'محتوى جديد من المعلمين.' },
                { key: 'weekly' as const, title: 'الملخص الأسبوعي', desc: 'تقرير مختصر كل يوم أحد.' },
                { key: 'system' as const, title: 'تنبيهات النظام', desc: 'تحديثات المنصة والإعلانات الإدارية.' },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{row.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{row.desc}</p>
                  </div>
                  <Switch checked={notifications[row.key]} onChange={(v) => setNotifications({ ...notifications, [row.key]: v })} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-extrabold text-slate-900">قنوات الوصول</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3"><Bell className="size-4 text-brand-500" /><div><p className="text-[11px] font-bold text-slate-700">داخل المنصة</p><p className="text-[9px] text-slate-400">مفعّل دائمًا</p></div></div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3"><Mail className="size-4 text-sky-500" /><div><p className="text-[11px] font-bold text-slate-700">البريد الإلكتروني</p><p className="text-[9px] text-slate-400">ملخص أسبوعي فقط</p></div></div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3 opacity-60"><Sparkles className="size-4 text-amber-500" /><div><p className="text-[11px] font-bold text-slate-700">واتساب</p><p className="text-[9px] text-slate-400">قريبًا</p></div></div>
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
              الإشعارات الفورية تظهر في الجرس أعلى الصفحة، وتُحفظ آخر ٣٠ يومًا.
            </div>
          </Card>
        </div>
      )}

      {tab === 'institution' && (
        <div className="grid gap-5 lg:grid-cols-3">
          {isSuper ? (
            <>
              <Card className="p-5 lg:col-span-2">
                <h2 className="mb-4 text-sm font-extrabold text-slate-900">إعدادات المنصة العامة</h2>
                <div className="divide-y divide-slate-50">
                  {[
                    { key: 'aiExams' as const, title: 'توليد الامتحانات بالذكاء الاصطناعي', desc: 'السماح للمعلمين برفع المواد وتوليد الأسئلة.' },
                    { key: 'reels' as const, title: 'الريلز التعليمية', desc: 'تفعيل نشر ومشاهدة المحتوى القصير.' },
                    { key: 'parentApp' as const, title: 'بوابة أولياء الأمور', desc: 'وصول أولياء الأمور لتقارير الأبناء.' },
                    { key: 'publicLanding' as const, title: 'صفحة الهبوط العامة', desc: 'إظهار الموقع التسويقي للزوار.' },
                    { key: 'maintenance' as const, title: 'وضع الصيانة', desc: 'إيقاف الوصول مؤقتًا لجميع المدارس.' },
                  ].map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-4 py-3.5">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{row.title}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{row.desc}</p>
                      </div>
                      <Switch checked={platform[row.key]} onChange={(v) => setPlatform({ ...platform, [row.key]: v })} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => { notify('حدّث إعدادات المنصة'); push({ title: 'تم حفظ إعدادات المنصة', tone: 'success' }) }}><Save className="size-4" /> حفظ الإعدادات</Button>
                </div>
              </Card>

              <div className="space-y-5">
                <Card className="p-5">
                  <h2 className="mb-3 text-sm font-extrabold text-slate-900">ملخص المنصة</h2>
                  <div className="space-y-2 text-[11px]">
                    <p className="flex items-center justify-between"><span className="text-slate-500">المدارس</span><b className="text-slate-800">{db.schools.length}</b></p>
                    <p className="flex items-center justify-between"><span className="text-slate-500">المستخدمون</span><b className="text-slate-800">{db.students.length + db.teachers.length + db.parents.length + db.managers.length}</b></p>
                    <p className="flex items-center justify-between"><span className="text-slate-500">الاشتراكات النشطة</span><b className="text-emerald-600">{db.subscriptions.filter((s) => s.status === 'active').length}</b></p>
                    <p className="flex items-center justify-between"><span className="text-slate-500">الإيراد الشهري</span><b className="text-slate-800">{db.schools.reduce((sum, s) => sum + s.monthlyPrice, 0)} ج.م</b></p>
                  </div>
                </Card>
                <Card className="border-brand-100 bg-brand-50/50 p-5">
                  <p className="flex items-center gap-1.5 text-xs font-extrabold text-brand-900"><SlidersHorizontal className="size-4" /> نسخة تجريبية</p>
                  <p className="mt-1.5 text-[10px] leading-5 text-brand-800">هذه الإعدادات تُحفظ أثناء الجلسة فقط في النسخة التجريبية، وليست مرتبطة بخادم حقيقي.</p>
                </Card>
              </div>
            </>
          ) : (
            <>
              <Card className="p-5 lg:col-span-2">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: school?.logoColor ?? '#4f46e5' }}>
                    {school?.shortName.slice(0, 1) ?? 'م'}
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">{school?.name ?? 'المدرسة'}</h2>
                    <p className="text-[10px] text-slate-400">{school?.city} • {school?.plan === 'enterprise' ? 'خطة مؤسسية' : school?.plan === 'pro' ? 'خطة احترافية' : 'خطة أساسية'}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="اسم المدرسة">
                    <input className="input" value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} />
                  </Field>
                  <Field label="هاتف المدرسة">
                    <input className="input" dir="ltr" value={schoolForm.phone} onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })} />
                  </Field>
                  <Field label="البريد الإلكتروني">
                    <input className="input" dir="ltr" value={schoolForm.email} onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })} />
                  </Field>
                  <Field label="العنوان">
                    <input className="input" value={schoolForm.address} onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })} />
                  </Field>
                </div>
                <div className="mt-5 flex justify-end">
                  <Button onClick={saveSchool}><Save className="size-4" /> حفظ بيانات المدرسة</Button>
                </div>
              </Card>

              <div className="space-y-5">
                <Card className="p-5">
                  <h2 className="mb-3 text-sm font-extrabold text-slate-900">اشتراك المدرسة</h2>
                  <div className="space-y-2 text-[11px]">
                    <p className="flex items-center justify-between"><span className="text-slate-500">الخطة</span><Badge tone="brand">{school?.plan === 'enterprise' ? 'مؤسسي' : school?.plan === 'pro' ? 'احترافي' : 'أساسي'}</Badge></p>
                    <p className="flex items-center justify-between"><span className="text-slate-500">الحالة</span><Badge tone={school?.status === 'active' ? 'emerald' : school?.status === 'trial' ? 'amber' : 'rose'}>{school?.status === 'active' ? 'نشط' : school?.status === 'trial' ? 'تجريبي' : 'منتهي'}</Badge></p>
                    <p className="flex items-center justify-between"><span className="text-slate-500">ينتهي في</span><b className="text-slate-800">{school ? formatDate(school.subscriptionEnd) : '—'}</b></p>
                    <p className="flex items-center justify-between"><span className="text-slate-500">السعر الشهري</span><b className="text-slate-800">{school?.monthlyPrice ?? 0} ج.م</b></p>
                  </div>
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">لتعديل الاشتراك تواصل مع مالك المنصة.</p>
                </Card>
                <Card className="p-5">
                  <h2 className="mb-3 text-sm font-extrabold text-slate-900">أرقام المدرسة</h2>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-brand-50 p-2.5"><p className="text-lg font-black text-brand-700">{db.students.length}</p><p className="text-[9px] font-bold text-brand-600">طالب</p></div>
                    <div className="rounded-xl bg-emerald-50 p-2.5"><p className="text-lg font-black text-emerald-700">{db.teachers.length}</p><p className="text-[9px] font-bold text-emerald-600">معلم</p></div>
                    <div className="rounded-xl bg-amber-50 p-2.5"><p className="text-lg font-black text-amber-700">{db.classes.length}</p><p className="text-[9px] font-bold text-amber-600">فصل</p></div>
                    <div className="rounded-xl bg-sky-50 p-2.5"><p className="text-lg font-black text-sky-700">{db.subjects.length}</p><p className="text-[9px] font-bold text-sky-600">مادة</p></div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'demo' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Sparkles className="size-5" /></span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">النسخة التجريبية</h2>
                <p className="mt-1 text-[11px] leading-6 text-slate-500">
                  هذه نسخة ديمو كاملة الواجهة ببيانات وهمية محفوظة في متصفحك. كل التغييرات التي تجريها (إضافة طالب، تعديل اشتراك، نشر إعلان) تبقى بعد تحديث الصفحة، لكنها لا تُرسل لأي خادم.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-[10px] font-bold text-slate-400">الحساب الحالي</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{roleMeta[role].label}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-[10px] font-bold text-slate-400">بيانات محفوظة</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">{db.students.length + db.teachers.length + db.parents.length + db.schools.length} سجل</p>
                <p className="text-[10px] text-slate-400">في localStorage</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="danger" onClick={() => { resetDemo(); navigate('/login') }}>
                <RotateCcw className="size-4" /> إعادة ضبط البيانات
              </Button>
              <Button variant="secondary" onClick={() => push({ title: 'تم إنشاء نسخة احتياطية', body: 'نسخة تجريبية من بيانات الديمو جاهزة.', tone: 'success' })}>
                نسخة احتياطية
              </Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-extrabold text-slate-900">ما الذي يمكنك تجربته؟</h2>
              <ul className="space-y-2 text-[11px] leading-6 text-slate-600">
                {[
                  'تبديل الحساب من أعلى الصفحة لتجربة كل الأدوار.',
                  'إضافة طالب أو معلم أو ولي أمر جديد.',
                  'إنشاء امتحان بالذكاء الاصطناعي أو يدويًا.',
                  'تسجيل الحضور والغياب لفصل كامل.',
                  'تعديل اشتراك مدرسة ومشاهدة تحديث البيانات.',
                ].map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 size-3.5 shrink-0 text-emerald-500" /> {item}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-slate-900"><Building2 className="size-4 text-slate-400" /> المدرسة الحالية</h2>
              <p className="text-xs font-bold text-slate-700">{isSuper ? 'كل المدارس' : school?.name ?? '—'}</p>
              <p className="mt-1 text-[10px] text-slate-400">{isSuper ? `${db.schools.length} مدارس مشتركة` : `العام الدراسي ٢٠٢٦ / ٢٠٢٧`}</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
