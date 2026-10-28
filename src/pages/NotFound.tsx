import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Home, Search } from 'lucide-react'
import { LogoMark } from '../components/Logo'
import { buttonStyles } from '../components/ui'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-6 py-16 text-white">
      <div className="pointer-events-none absolute -top-32 start-1/4 size-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 end-1/4 size-96 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300">
          <LogoMark size={26} /> منصة مُعلّم
        </div>
        <p className="text-7xl font-black tracking-tight text-white/90 sm:text-8xl">٤٠٤</p>
        <h1 className="mt-3 text-xl font-extrabold sm:text-2xl">الصفحة غير موجودة</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-slate-400">
          يبدو أن الرابط الذي تحاول الوصول إليه غير صحيح أو تم نقله. لنعد بك إلى مكان مألوف.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Link to="/" className={buttonStyles('secondary', 'md')}>
            <Home className="size-4" /> الصفحة الرئيسية
          </Link>
          <Link to="/app" className={buttonStyles('primary', 'md')}>
            <Compass className="size-4" /> لوحة التحكم <ArrowRight className="size-4" />
          </Link>
        </div>
        <p className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Search className="size-3.5" /> جرّب العودة للقائمة الرئيسية أو تسجيل الدخول بحساب تجريبي.
        </p>
      </div>
    </div>
  )
}
