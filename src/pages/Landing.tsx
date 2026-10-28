import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, BookOpen, Brain, CalendarCheck, Check, Clapperboard, GraduationCap,
  Menu, Play, Quote, ShieldCheck, Sparkles, Star, Users, X, Zap,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui'
import { cn } from '../lib/utils'
import type { Role } from '../types'
import { roleMeta } from '../components/AppLayout'

const features = [
  { icon: SchoolIcon, title: 'إدارة مدرسية متكاملة', body: 'الطلاب، المعلمون، الفصول، المواد، الجداول والحضور — كل شيء في لوحة واحدة.', color: 'bg-brand-50 text-brand-600' },
  { icon: Clapperboard, title: 'ريلز تعليمية', body: 'المعلم يرفع شرحًا قصيرًا، والطالب يتعلم في دقائق بأسلوب يحبه.', color: 'bg-rose-50 text-rose-600' },
  { icon: Brain, title: 'امتحانات بالذكاء الاصطناعي', body: 'ارفع المادة العلمية، ودع المنصة تولّد أسئلة متوازنة في ثوانٍ.', color: 'bg-violet-50 text-violet-600' },
  { icon: BarChart3, title: 'تحليلات ونقاط ضعف', body: 'مستوى كل طالب، مهاراته، ونقاط الضعف — برسوم واضحة وقابلة للتنفيذ.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: CalendarCheck, title: 'حضور وغياب ذكي', body: 'تسجيل الحضور بضغطة، وتقارير تلقائية لأولياء الأمور.', color: 'bg-amber-50 text-amber-600' },
  { icon: Users, title: 'شراكة مع ولي الأمر', body: 'ولي الأمر يتابع الدرجات، الحضور، والتقدم لحظة بلحظة.', color: 'bg-sky-50 text-sky-600' },
]

function SchoolIcon(props: { className?: string }) {
  return <GraduationCap {...props} />
}

const roleCopy: Record<Role, { desc: string; points: string[] }> = {
  super_admin: { desc: 'أدر المنصة بالكامل: المدارس، الاشتراكات، الإيرادات وصلاحيات المدراء.', points: ['إنشاء مدارس جديدة', 'متابعة الاشتراكات', 'تقارير المنصة'] },
  manager: { desc: 'تحكم كامل في مدرستك: الطلاب، المعلمون، الفصول والمواد.', points: ['إضافة الطلاب والمعلمين', 'إنشاء الفصول', 'متابعة الأداء العام'] },
  teacher: { desc: 'علّم بطريقتك: ريلز، امتحانات ذكية، وتحليلات دقيقة لكل طالب.', points: ['رفع ريلز تعليمية', 'توليد امتحانات AI', 'رصد الحضور'] },
  student: { desc: 'تعلّم بمتعتك: ريلز قصيرة، امتحانات تفاعلية، ومتابعة مستواك.', points: ['مشاهدة الريلز', 'حل الامتحانات', 'معرفة نقاط قوتك'] },
  parent: { desc: 'اطمئن على ابنك: الدرجات، الحضور، والتقدم في مكان واحد.', points: ['متابعة الدرجات', 'تقارير الحضور', 'تواصل مع المدرسة'] },
}

const pricing = [
  { name: 'الأساسية', price: '4,500', desc: 'للمدارس الصغيرة التي تبدأ رحلتها الرقمية.', features: ['حتى ٣٠٠ طالب', '١٠ معلمين', 'لوحة المدير والطلاب', 'الحضور والدرجات', 'دعم عبر البريد'], cta: 'ابدأ الآن', highlight: false },
  { name: 'الاحترافية', price: '9,500', desc: 'الخيار الأكثر اختيارًا للمدارس المتوسطة.', features: ['حتى ١٠٠٠ طالب', '٥٠ معلمًا', 'كل مميزات الأساسية', 'ريلز وامتحانات AI', 'تحليلات متقدمة', 'تطبيق أولياء الأمور', 'دعم أولوية ٢٤/٧'], cta: 'جرّب ١٤ يومًا مجانًا', highlight: true },
  { name: 'المؤسسية', price: 'تواصل', desc: 'لمجموعات المدارس والاحتياجات الخاصة.', features: ['طلاب غير محدودين', 'مدارس متعددة', 'تخصيص كامل', 'SSO وتكاملات', 'مدير حساب مخصص', 'اتفاقية مستوى خدمة'], cta: 'تحدث معنا', highlight: false },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white">
      {/* Top strip */}
      <div className="bg-slate-950 px-4 py-2 text-center text-[11px] font-semibold text-slate-300">
        <span className="me-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400" /> جديد
        </span>
        توليد الامتحانات بالذكاء الاصطناعي متاح الآن لجميع المدارس
        <Link to="/login" className="ms-2 text-white underline decoration-brand-400 underline-offset-2">جرّبها</Link>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-[13px] font-bold text-slate-600 lg:flex">
            <a href="#features" className="hover:text-brand-600">المزايا</a>
            <a href="#roles" className="hover:text-brand-600">الأدوار</a>
            <a href="#ai" className="hover:text-brand-600">الذكاء الاصطناعي</a>
            <a href="#pricing" className="hover:text-brand-600">الأسعار</a>
            <a href="#stories" className="hover:text-brand-600">آراء المدارس</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block">دخول</Link>
            <Link to="/login"><Button size="sm" className="h-10">جرّب الديمو <ArrowLeft className="size-4" /></Button></Link>
            <button className="rounded-xl p-2 text-slate-600 lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="القائمة">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-3 text-sm font-bold text-slate-700">
              <a href="#features" onClick={() => setMenuOpen(false)}>المزايا</a>
              <a href="#roles" onClick={() => setMenuOpen(false)}>الأدوار</a>
              <a href="#ai" onClick={() => setMenuOpen(false)}>الذكاء الاصطناعي</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>الأسعار</a>
              <Link to="/login" className="text-brand-600">تسجيل الدخول</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh pb-16 pt-12 sm:pt-16 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="size-3.5" />
              المنصة التي تجمع المدرسة كلها في مكان واحد
            </div>
            <h1 className="text-balance text-[38px] font-black leading-[1.15] tracking-tight text-slate-950 sm:text-5xl lg:text-[56px]">
              مدرسة أذكى،
              <br />
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 bg-gradient-to-l from-brand-600 via-violet-600 to-teal-500 bg-clip-text text-transparent">تعليم أفضل.</span>
                <svg className="absolute -bottom-2 right-0 h-3 w-full text-brand-200" viewBox="0 0 200 12" preserveAspectRatio="none" fill="currentColor">
                  <path d="M0 8c30-6 70-8 100-6s70 4 100 6v4H0V8Z" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-[15px] leading-8 text-slate-600 sm:text-base">
              منصة إدارة تعليمية متكاملة تربط السوبر أدمن، المدير، المعلم، الطالب وولي الأمر.
              ريلز تعليمية، امتحانات بالذكاء الاصطناعي، تحليلات لمستوى كل طالب، ومتابعة لحظية للحضور والدرجات.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/login">
                <Button size="lg" className="shadow-xl shadow-brand-600/25">
                  ابدأ التجربة المجانية <ArrowLeft className="size-4.5" />
                </Button>
              </Link>
              <a href="#roles">
                <Button size="lg" variant="secondary" className="bg-white/80 backdrop-blur">
                  <Play className="size-4 fill-current" /> شاهد كيف تعمل
                </Button>
              </a>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-500" /> بدون بطاقة بنكية</span>
              <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-500" /> إعداد في أقل من يوم</span>
              <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-500" /> دعم عربي كامل</span>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200/70 pt-6">
              {[['١٢٠+', 'مدرسة'], ['٤٥ ألف', 'طالب'], ['٣.٢ ألف', 'معلم']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-slate-900">{v}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative animate-fade-up delay-200 lg:pe-4">
            <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-brand-200/50 via-violet-200/30 to-teal-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[26px] border border-white/70 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur">
              {/* fake browser bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-rose-400" />
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span className="size-2.5 rounded-full bg-emerald-400" />
                <span className="mx-auto rounded-md bg-white px-6 py-1 text-[9px] font-semibold text-slate-400 shadow-sm">app.moallem.school</span>
              </div>
              <div className="flex">
                <div className="hidden w-14 shrink-0 flex-col items-center gap-4 bg-slate-950 py-5 sm:flex">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 text-white">
                    <GraduationCap className="size-4" />
                  </span>
                  <span className="size-6 rounded-lg bg-white/15" />
                  <span className="size-6 rounded-lg bg-white/10" />
                  <span className="size-6 rounded-lg bg-white/10" />
                  <span className="size-6 rounded-lg bg-white/10" />
                </div>
                <div className="flex-1 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-semibold text-slate-400">الأربعاء، ٢٨ أكتوبر</p>
                      <p className="text-sm font-black text-slate-900">صباح الخير، أ. محمد 👋</p>
                    </div>
                    <div className="flex -space-x-2 space-x-reverse">
                      {['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'].map((c) => (
                        <span key={c} className="size-6 rounded-full border-2 border-white" style={{ background: c }} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'طلابي', value: '٨٦', color: 'text-brand-600', icon: Users },
                      { label: 'متوسط الدرجات', value: '٨٢٪', color: 'text-emerald-600', icon: BarChart3 },
                      { label: 'امتحان قادم', value: '٢', color: 'text-amber-600', icon: Clapperboard },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                        <s.icon className={cn('mb-2 size-3.5', s.color)} />
                        <p className="text-base font-black text-slate-900">{s.value}</p>
                        <p className="text-[8px] font-semibold text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[9px] font-bold text-slate-600">أداء الفصل — آخر ٦ أسابيع</p>
                      <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">+٦٪</span>
                    </div>
                    <div className="flex h-16 items-end gap-1.5">
                      {[45, 62, 55, 70, 65, 82, 78, 90, 86, 95].map((h, i) => (
                        <span key={i} className={cn('flex-1 rounded-t-md', i > 6 ? 'bg-brand-500' : 'bg-brand-100')} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-violet-100 bg-gradient-to-l from-violet-50 to-white p-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-violet-600 text-white"><Brain className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-slate-800">تم توليد ٧ أسئلة من المذكرة</p>
                      <p className="text-[8px] text-slate-400">الذكاء الاصطناعي جاهز للمراجعة</p>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-[8px] font-bold text-violet-600 shadow-sm">مراجعة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -start-3 bottom-14 hidden w-40 animate-float rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:block">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500"><Clapperboard className="size-4" /></span>
                <div>
                  <p className="text-[9px] font-bold text-slate-800">ريلز الرياضيات</p>
                  <p className="text-[8px] text-slate-400">١٢.٤ ألف مشاهدة</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full bg-rose-400" /></div>
            </div>
            <div className="absolute -end-2 top-24 hidden animate-float rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-xl delay-200 sm:block">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="size-4" /></span>
                <div>
                  <p className="text-[9px] font-bold text-slate-800">تم رصد الحضور</p>
                  <p className="text-[8px] text-slate-400">٢٦ طالبًا — ٢ / أ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-slate-100 bg-white py-7">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 text-slate-400 sm:px-6">
          <span className="text-[11px] font-bold text-slate-400">تثق بنا مدارس:</span>
          {['مدارس الأندلس', 'النور الدولية', 'رواد المعرفة', 'المستقبل الحديثة', 'أكاديمية الأمل'].map((n) => (
            <span key={n} className="text-sm font-extrabold text-slate-500/70">{n}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">كل ما تحتاجه مدرستك</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">نظام واحد بدل ٧ أدوات متفرقة</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            صممنا مُعلّم من احتياجات المدارس الحقيقية. من تسجيل الطالب حتى تقرير ولي الأمر، كل شيء مترابط وسهل.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group card card-hover p-6">
              <span className={cn('mb-5 inline-flex size-12 items-center justify-center rounded-2xl', f.color)}>
                <f.icon className="size-6" />
              </span>
              <h3 className="text-base font-extrabold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-7 text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="pointer-events-none absolute -top-32 start-1/4 size-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 end-0 size-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-300">خمس تجارب في منصة واحدة</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">لكل دور لوحته الخاصة</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">جرّب أي حساب بضغطة واحدة، وشاهد كيف تتكامل رحلة التعليم من الإدارة حتى ولي الأمر.</p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {(['super_admin', 'manager', 'teacher', 'student', 'parent'] as Role[]).map((r) => {
              const meta = roleMeta[r]
              const copy = roleCopy[r]
              return (
                <Link
                  key={r}
                  to={`/login?role=${r}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-brand-400/40 hover:bg-white/[0.08]"
                >
                  <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-white/10 text-white transition group-hover:bg-brand-500">
                    <meta.icon className="size-5" />
                  </span>
                  <h3 className="text-sm font-extrabold">{meta.short}</h3>
                  <p className="mt-2 text-[11px] leading-6 text-slate-400">{copy.desc}</p>
                  <ul className="mt-3 space-y-1.5">
                    {copy.points.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                        <Check className="mt-0.5 size-3 shrink-0 text-emerald-400" /> {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-brand-300">
                    جرّب الحساب <ArrowLeft className="size-3.5 transition group-hover:-translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
              <Zap className="size-3.5" /> المدعوم بالذكاء الاصطناعي
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
              ارفع المذكرة…
              <br />
              واستلم الامتحان جاهزًا.
            </h2>
            <p className="mt-4 text-sm leading-8 text-slate-500">
              لا تضيّع ساعات في كتابة الأسئلة. حمّل ملف PDF أو Word أو حتى صورة، وسيقوم مُعلّم بتحليل المحتوى
              وتوليد أسئلة متنوعة المستويات، مع الإجابات النموذجية وتوزيع الدرجات.
            </p>
            <div className="mt-6 space-y-3">
              {[
                ['تحليل ذكي للمحتوى', 'يفهم المادة العلمية ويستخرج المفاهيم الأساسية.'],
                ['تحكم كامل', 'حدد عدد الأسئلة، الصعوبة، ونوع الأسئلة (اختيار من متعدد / صح وخطأ).'],
                ['مراجعة قبل النشر', 'عدّل أي سؤال أو درجة قبل أن يصل للطلاب.'],
              ].map(([t, d], i) => (
                <div key={t} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white">{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t}</p>
                    <p className="text-xs leading-6 text-slate-500">{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/login?role=teacher" className="mt-7 inline-block">
              <Button variant="dark">جرّب مولّد الامتحانات <ArrowLeft className="size-4" /></Button>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-violet-200/60 to-teal-200/40 blur-2xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white"><Brain className="size-5" /></span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">مساعد الامتحانات</p>
                    <p className="text-[10px] text-slate-400">جاهز للتحليل</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">AI</span>
              </div>

              <div className="mt-4 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-5 text-center">
                <span className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm"><BookOpen className="size-5" /></span>
                <p className="text-xs font-bold text-slate-700">مذكرة_التفاضل_الفصل_الثالث.pdf</p>
                <p className="mt-1 text-[10px] text-slate-400">٢.٤ ميجابايت — تم الرفع</p>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  ['ما قيمة النهاية lim x→2 (x²−4)/(x−2)؟', '٤'],
                  ['مشتقة f(x) = 3x² + 2x هي…', '6x + 2'],
                  ['المشتقة الثانية تحدد نوع النقطة الحرجة.', 'صحيح'],
                ].map(([q, a], i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold leading-6 text-slate-700">{i + 1}. {q}</p>
                      <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">{a}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-white">
                <span className="text-[10px] font-bold">٧ أسئلة • ١٢ درجة • ٣٠ دقيقة</span>
                <span className="rounded-lg bg-brand-500 px-3 py-1.5 text-[10px] font-bold">نشر الامتحان</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reels */}
      <section className="bg-slate-50/80 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-500">تعلّم في ٦٠ ثانية</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">الريلز… التعليم اللي الطلاب بيحبوه</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">فيديوهات قصيرة من معلميك، بأسلوب سريع وممتع. شاهد، احفظ، وارجع للمعلومة وقت ما تحتاج.</p>
            </div>
            <Link to="/login?role=student"><Button variant="secondary">شاهد الريلز <ArrowLeft className="size-4" /></Button></Link>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { g: 'from-indigo-600 via-violet-600 to-fuchsia-500', e: '∫', t: 'خدعة النهايات في ٣٠ ثانية', s: 'رياضيات', v: '١٢.٤ ألف' },
              { g: 'from-sky-500 via-blue-600 to-indigo-700', e: '🪐', t: 'ليه القمر مبيقعش علينا؟', s: 'فيزياء', v: '٨.٩ ألف' },
              { g: 'from-amber-500 via-orange-500 to-rose-500', e: '✍️', t: 'إعراب الفاعل في دقيقة', s: 'لغة عربية', v: '١٥.٢ ألف' },
              { g: 'from-rose-500 via-pink-600 to-purple-600', e: '🇬🇧', t: 'Stop saying "I am agree"', s: 'English', v: '٢١ ألف' },
            ].map((r) => (
              <div key={r.t} className={cn('group relative aspect-[9/13] overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg transition hover:-translate-y-1', r.g)}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.22),transparent_50%)]" />
                <span className="relative text-5xl font-black opacity-30">{r.e}</span>
                <div className="absolute inset-x-3 bottom-3">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold backdrop-blur">{r.s}</span>
                  <p className="mt-2 text-sm font-extrabold leading-6">{r.t}</p>
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-white/80">
                    <Play className="size-3 fill-current" /> {r.v} مشاهدة
                  </div>
                </div>
                <span className="absolute start-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 opacity-0 backdrop-blur transition group-hover:opacity-100">
                  <Play className="size-5 fill-white" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">قالوا عن مُعلّم</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">مدارس حقيقية، نتائج حقيقية</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { name: 'خالد المنصور', role: 'مدير مدرسة النور الدولية', text: 'وفّرنا ساعات من العمل الورقي. تقارير الحضور والدرجات بقت تلقائية، وأولياء الأمور بقوا أكثر اطمئنانًا.', color: '#4f46e5' },
            { name: 'أ. محمد العزب', role: 'معلم رياضيات', text: 'مولّد الامتحانات غيّر طريقة تحضيري. برفع المذكرة وبعد دقائق عندي أسئلة متنوعة، وبعدل عليها بسهولة.', color: '#0ea5e9' },
            { name: 'سامي عبد الرحمن', role: 'ولي أمر', text: 'أول مرة أعرف مستوى ابني ونقاط ضعفه بالتفصيل. الريلز كمان خلت المذاكرة أسهل بكتير عليه.', color: '#10b981' },
          ].map((t) => (
            <div key={t.name} className="card p-6">
              <div className="mb-4 flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
              </div>
              <Quote className="mb-2 size-5 text-slate-200" />
              <p className="text-[13px] leading-7 text-slate-600">«{t.text}»</p>
              <div className="mt-5 flex items-center gap-2.5 border-t border-slate-100 pt-4">
                <span className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: t.color }}>{t.name[0]}</span>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">أسعار واضحة</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">اختر الخطة المناسبة لمدرستك</h2>
            <p className="mt-3 text-sm text-slate-500">جميع الخطط تشمل تحديثات مجانية ودعمًا فنيًا باللغة العربية. الأسعار بالجنيه المصري شهريًا.</p>
          </div>
          <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
            {pricing.map((p) => (
              <div key={p.name} className={cn('relative rounded-3xl border bg-white p-6', p.highlight ? 'border-brand-500 shadow-2xl shadow-brand-600/15 lg:-mt-3 lg:pb-8' : 'border-slate-200 shadow-sm')}>
                {p.highlight && (
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-extrabold text-white shadow-lg">الأكثر اختيارًا</span>
                )}
                <h3 className="text-base font-extrabold text-slate-900">{p.name}</h3>
                <p className="mt-1.5 text-xs leading-6 text-slate-500">{p.desc}</p>
                <p className="mt-5 flex items-end gap-1.5">
                  <span className="text-4xl font-black tracking-tight text-slate-950">{p.price}</span>
                  {p.price !== 'تواصل' && <span className="pb-1 text-xs font-semibold text-slate-400">ج.م / شهريًا</span>}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs font-semibold text-slate-600">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="size-2.5" /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="mt-7 block">
                  <Button className="w-full" variant={p.highlight ? 'primary' : 'secondary'}>{p.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-20" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur"><Sparkles className="size-3.5" /> تجربة مجانية ١٤ يومًا</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">جاهز تنقل مدرستك للمستقبل؟</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/80">ابدأ الآن وشاهد الفرق من أول أسبوع. لا تحتاج بطاقة بنكية، وفريقنا معاك خطوة بخطوة.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/login"><Button size="lg" className="bg-white text-brand-700 shadow-xl hover:bg-slate-50">ابدأ التجربة الآن <ArrowLeft className="size-4" /></Button></Link>
              <a href="mailto:hello@moallem.app"><Button size="lg" variant="ghost" className="border border-white/25 text-white hover:bg-white/10">تحدث مع فريق المبيعات</Button></a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-semibold text-white/70">
              <span className="flex items-center gap-1"><ShieldCheck className="size-3.5" /> بيانات مشفرة</span>
              <span className="flex items-center gap-1"><Check className="size-3.5" /> إلغاء في أي وقت</span>
              <span className="flex items-center gap-1"><Users className="size-3.5" /> ترحيل بياناتك مجانًا</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-xs leading-6 text-slate-500">منصة إدارة تعليمية عربية تجمع الإدارة، المعلمين، الطلاب وأولياء الأمور في تجربة واحدة بسيطة وقوية.</p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <ShieldCheck className="size-4 text-emerald-500" /> متوافق مع معايير حماية بيانات الطلاب
            </div>
          </div>
          {[
            ['المنتج', ['المزايا', 'الأسعار', 'الأسئلة الشائعة', 'التحديثات']],
            ['الحلول', ['للمدارس الخاصة', 'للمجموعات التعليمية', 'للمراكز', 'للمعلمين']],
            ['الشركة', ['من نحن', 'تواصل معنا', 'سياسة الخصوصية', 'الشروط والأحكام']],
          ].map(([title, links]) => (
            <div key={title as string}>
              <p className="mb-3 text-xs font-extrabold text-slate-900">{title}</p>
              <ul className="space-y-2">
                {(links as string[]).map((l) => <li key={l}><a href="#" className="text-[11px] font-semibold text-slate-500 hover:text-brand-600">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-slate-400">
            <span>© ٢٠٢٦ مُعلّم. جميع الحقوق محفوظة.</span>
            <span className="flex items-center gap-1">صُنع بحب في مصر <span className="text-rose-500">♥</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
