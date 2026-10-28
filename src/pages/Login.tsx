import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useStore } from '../lib/store'
import { useToast, Avatar } from '../components/ui'
import { roleMeta } from '../components/AppLayout'
import { cn } from '../lib/utils'
import type { Role } from '../types'

const roles: Role[] = ['super_admin', 'manager', 'teacher', 'student', 'parent']
const demoEmails: Record<Role, string> = {
  super_admin: 'admin@moallem.app',
  manager: 'manager@alnoor.edu.eg',
  teacher: 'mohamed@alnoor.edu.eg',
  student: 'student1@alnoor.edu.eg',
  parent: 'samy@mail.com',
}

export default function Login() {
  const [params] = useSearchParams()
  const initialRole = (params.get('role') as Role) || 'student'
  const [role, setRole] = useState<Role>(roles.includes(initialRole) ? initialRole : 'student')
  const [email, setEmail] = useState(demoEmails[roles.includes(initialRole) ? initialRole : 'student'])
  const [password, setPassword] = useState('123456')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, db } = useStore()
  const navigate = useNavigate()
  const { push } = useToast()

  const demoUser = (r: Role) =>
    r === 'super_admin' ? db.superAdmins[0]
      : r === 'manager' ? db.managers[0]
        : r === 'teacher' ? db.teachers[0]
          : r === 'student' ? db.students[0]
            : db.parents[0]

  const doLogin = (target: Role = role) => {
    setLoading(true)
    setTimeout(() => {
      login(target)
      setLoading(false)
      push({ title: `أهلًا ${demoUser(target)?.name ?? ''} 👋`, body: 'تم تسجيل الدخول بنجاح — هذه نسخة تجريبية.', tone: 'success' })
      navigate('/app')
    }, 650)
  }

  const pickRole = (r: Role) => {
    setRole(r)
    setEmail(demoEmails[r])
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Form side */}
      <div className="flex w-full flex-col lg:w-[55%]">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/"><Logo /></Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-900">
            العودة للرئيسية <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-6 sm:px-8">
          <div className="w-full max-w-md animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" /> نسخة تجريبية — الدخول بأي بيانات
            </span>
            <h1 className="mt-4 text-[26px] font-black tracking-tight text-slate-950">أهلًا بعودتك 👋</h1>
            <p className="mt-1.5 text-sm text-slate-500">سجّل الدخول للمتابعة إلى لوحة التحكم الخاصة بك.</p>

            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); doLogin() }}>
              <div>
                <label className="label">الدخول كـ</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {roles.map((r) => {
                    const meta = roleMeta[r]
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => pickRole(r)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-[10px] font-bold transition',
                          role === r ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                        )}
                      >
                        <meta.icon className="size-4" />
                        {meta.short}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="label">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="input ps-10" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="label">كلمة المرور</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input px-10"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <input type="checkbox" defaultChecked className="size-3.5 rounded border-slate-300 accent-brand-600" /> تذكرني
                </label>
                <a href="#" className="text-[11px] font-bold text-brand-600 hover:text-brand-700">نسيت كلمة المرور؟</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>تسجيل الدخول <ArrowLeft className="size-4" /></>}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-400">أو ادخل بحساب تجريبي</span>
              <span className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="space-y-1.5">
              {roles.map((r) => {
                const meta = roleMeta[r]
                const user = demoUser(r)
                return (
                  <button
                    key={r}
                    onClick={() => doLogin(r)}
                    className="flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 text-start transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <Avatar name={user?.name ?? meta.label} color={meta.color} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-800">{user?.name ?? meta.label}</span>
                      <span className="block text-[10px] text-slate-400">{meta.label} — {demoEmails[r]}</span>
                    </span>
                    <ArrowLeft className="size-3.5 text-slate-300" />
                  </button>
                )
              })}
            </div>

            <p className="mt-5 text-center text-[10px] text-slate-400">
              بالمتابعة أنت توافق على <a href="#" className="font-bold text-slate-500 underline">الشروط</a> و<a href="#" className="font-bold text-slate-500 underline">سياسة الخصوصية</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden w-[45%] overflow-hidden bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/70 via-slate-950 to-teal-900/70" />
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <div className="absolute -top-24 -end-24 size-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -start-24 size-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-2 text-xs font-bold text-white/80">
            <ShieldCheck className="size-4 text-emerald-400" /> منصة موثوقة من أكثر من ١٢٠ مدرسة
          </div>

          <div>
            <div className="mb-6 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-amber-400 text-amber-400" />)}
            </div>
            <blockquote className="text-2xl font-extrabold leading-[1.8] text-white">
              «المنصة مش بس وفّرت وقتنا… غيّرت طريقة تواصلنا مع أولياء الأمور. كل حاجة واضحة، وكل طالب له متابعة شخصية.»
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white ring-2 ring-white/20">خ</span>
              <div>
                <p className="text-sm font-extrabold text-white">خالد المنصور</p>
                <p className="text-[11px] text-white/50">مدير مدرسة النور الدولية</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { label: 'طلاب نشطين', value: '٤٥K+', icon: GraduationCap },
                { label: 'امتحان AI', value: '٨.٢K', icon: Sparkles },
                { label: 'رضا المدارس', value: '٩٨٪', icon: Check },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
                  <s.icon className="mb-3 size-4 text-brand-300" />
                  <p className="text-lg font-black text-white">{s.value}</p>
                  <p className="text-[10px] font-semibold text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur">
            <div className="flex -space-x-2 space-x-reverse">
              {['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'].map((c) => (
                <span key={c} className="size-7 rounded-full border-2 border-slate-900" style={{ background: c }} />
              ))}
            </div>
            <p className="text-[10px] font-semibold text-white/60">انضم لآلاف المعلمين والطلاب</p>
          </div>
        </div>
      </div>
    </div>
  )
}
