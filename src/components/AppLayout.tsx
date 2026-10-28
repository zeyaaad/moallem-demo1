import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, BookOpen, CalendarCheck, CheckCheck, ChevronDown, ClipboardList, Clapperboard,
  CreditCard, GraduationCap, History, LayoutDashboard, LogOut, Megaphone, Menu, RotateCcw, School,
  Search, Settings, Sparkles, TrendingUp, UserCog, Users, X, type LucideIcon,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { cn } from '../lib/utils'
import { Avatar, useToast } from './ui'
import { Logo } from './Logo'
import type { Role } from '../types'

interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

export const roleMeta: Record<Role, { label: string; short: string; icon: LucideIcon; color: string }> = {
  super_admin: { label: 'مالك المنصة', short: 'سوبر أدمن', icon: Sparkles, color: '#7c3aed' },
  manager: { label: 'مدير المدرسة', short: 'مدير', icon: School, color: '#0f172a' },
  teacher: { label: 'معلم', short: 'معلم', icon: GraduationCap, color: '#0ea5e9' },
  student: { label: 'طالب', short: 'طالب', icon: BookOpen, color: '#10b981' },
  parent: { label: 'ولي أمر', short: 'ولي أمر', icon: Users, color: '#f59e0b' },
}

const navByRole: Record<Role, NavItem[]> = {
  super_admin: [
    { to: '/app', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/app/schools', label: 'المدارس', icon: School },
    { to: '/app/subscriptions', label: 'الاشتراكات', icon: CreditCard },
    { to: '/app/plans', label: 'خطط الأسعار', icon: Sparkles },
    { to: '/app/audit', label: 'سجل النشاط', icon: History },
    { to: '/app/settings', label: 'إعدادات المنصة', icon: Settings },
  ],
  manager: [
    { to: '/app', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/app/students', label: 'الطلاب', icon: Users },
    { to: '/app/manage/teachers', label: 'المعلمون', icon: GraduationCap },
    { to: '/app/manage/parents', label: 'أولياء الأمور', icon: UserCog },
    { to: '/app/manage/classes', label: 'الفصول والمستويات', icon: School },
    { to: '/app/manage/subjects', label: 'المواد الدراسية', icon: BookOpen },
    { to: '/app/attendance', label: 'الحضور والغياب', icon: CalendarCheck },
    { to: '/app/announcements', label: 'الإعلانات', icon: Megaphone },
    { to: '/app/settings', label: 'إعدادات المدرسة', icon: Settings },
  ],
  teacher: [
    { to: '/app', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/app/reels', label: 'الريلز التعليمية', icon: Clapperboard },
    { to: '/app/exams', label: 'الامتحانات', icon: ClipboardList },
    { to: '/app/results', label: 'النتائج والتحليلات', icon: BarChart3 },
    { to: '/app/students', label: 'طلابي', icon: Users },
    { to: '/app/attendance', label: 'الحضور والغياب', icon: CalendarCheck },
    { to: '/app/settings', label: 'الإعدادات', icon: Settings },
  ],
  student: [
    { to: '/app', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/app/reels', label: 'الريلز', icon: Clapperboard },
    { to: '/app/teachers', label: 'المعلمون', icon: GraduationCap },
    { to: '/app/exams', label: 'الامتحانات', icon: ClipboardList },
    { to: '/app/results', label: 'درجاتي', icon: BarChart3 },
    { to: '/app/progress', label: 'تقدمي', icon: TrendingUp },
    { to: '/app/settings', label: 'الإعدادات', icon: Settings },
  ],
  parent: [
    { to: '/app', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/app/child', label: 'مستوى ابني', icon: GraduationCap },
    { to: '/app/results', label: 'الدرجات', icon: BarChart3 },
    { to: '/app/attendance', label: 'الحضور والغياب', icon: CalendarCheck },
    { to: '/app/teachers', label: 'المعلمون', icon: Users },
    { to: '/app/settings', label: 'الإعدادات', icon: Settings },
  ],
}

const roleOrder: Role[] = ['super_admin', 'manager', 'teacher', 'student', 'parent']

export default function AppLayout() {
  const { currentUser, school, logout, resetDemo, login, db, markAllNotificationsRead, markNotificationRead } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { push } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSidebarOpen(false)
    setNotifOpen(false)
    setRoleOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!currentUser) return null
  const role = currentUser.role
  const nav = navByRole[role]
  const myNotifications = db.notifications.filter((n) => n.role === role)
  const unread = myNotifications.filter((n) => !n.read).length
  const current = [...nav].sort((a, b) => b.to.length - a.to.length).find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )

  const handleSwitch = (next: Role) => {
    login(next)
    setRoleOpen(false)
    navigate('/app')
    push({ title: `تم التبديل إلى حساب ${roleMeta[next].label}`, tone: 'info' })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-[270px] flex-col overflow-hidden bg-[#0b1220] text-white transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="pointer-events-none absolute -top-24 start-1/2 size-64 -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="relative flex items-center justify-between px-5 py-5">
          <Logo dark />
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <div className="relative mx-4 mb-5 rounded-xl border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
              {role === 'super_admin' ? <Sparkles className="size-4" /> : <School className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold">{role === 'super_admin' ? 'منصة مُعلّم' : school?.name ?? 'المدرسة'}</p>
              <p className="text-[10px] text-slate-400">
                {role === 'super_admin' ? `${db.schools.length} مدارس مشتركة` : 'العام الدراسي ٢٠٢٦ / ٢٠٢٧'}
              </p>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">القائمة الرئيسية</p>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition',
                isActive
                  ? 'bg-gradient-to-l from-brand-600/90 to-brand-500/80 text-white shadow-lg shadow-brand-900/30'
                  : 'text-slate-400 hover:bg-white/[0.07] hover:text-white',
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.to === '/app/exams' && role !== 'teacher' && <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold">{db.exams.filter((e) => e.status === 'published').length}</span>}
            </NavLink>
          ))}

          <div className="my-4 border-t border-white/10" />
          <button
            onClick={() => { resetDemo(); navigate('/login') }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white/[0.07] hover:text-white"
          >
            <RotateCcw className="size-[18px]" />
            إعادة ضبط النسخة التجريبية
          </button>
        </nav>

        <div className="relative m-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400">{roleMeta[role].label}</p>
            </div>
            <button onClick={handleLogout} title="تسجيل الخروج" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-rose-400">
              <LogOut className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-2 py-1.5 text-[10px] font-bold text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-400" />
            نسخة تجريبية — بيانات وهمية
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="lg:ps-[270px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-5" />
            </button>

            <div className="hidden min-w-0 items-center gap-2 text-sm md:flex">
              <span className="font-semibold text-slate-400">لوحة التحكم</span>
              {current && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="truncate font-bold text-slate-800">{current.label}</span>
                </>
              )}
            </div>

            <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
              <div className="relative hidden lg:block">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="ابحث عن طالب، معلم، امتحان…"
                  className="h-9.5 w-64 rounded-xl border border-slate-200 bg-slate-50/70 pe-3 ps-9 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>

              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen((v) => !v); setRoleOpen(false) }}
                  className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="الإشعارات"
                >
                  <Bell className="size-5" />
                  {unread > 0 && (
                    <span className="absolute end-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute end-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-pop">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-extrabold">الإشعارات</p>
                      <button onClick={markAllNotificationsRead} className="flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700">
                        <CheckCheck className="size-3.5" /> تعليم الكل كمقروء
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {myNotifications.slice(0, 6).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={cn('flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-start transition hover:bg-slate-50', !n.read && 'bg-brand-50/40')}
                        >
                          <span className={cn('mt-1 size-2 shrink-0 rounded-full', n.read ? 'bg-slate-200' : 'bg-brand-500')} />
                          <span className="min-w-0">
                            <span className="block text-xs font-bold text-slate-800">{n.title}</span>
                            <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">{n.body}</span>
                            <span className="mt-1 block text-[10px] text-slate-400">{n.time}</span>
                          </span>
                        </button>
                      ))}
                      {myNotifications.length === 0 && <p className="px-4 py-8 text-center text-xs text-slate-400">لا توجد إشعارات</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => { setRoleOpen((v) => !v); setNotifOpen(false) }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pe-2.5 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Avatar name={currentUser.name} color={currentUser.avatarColor} size="xs" />
                  <span className="hidden text-start sm:block">
                    <span className="block text-[11px] font-extrabold leading-tight text-slate-800">{currentUser.name}</span>
                    <span className="block text-[9px] font-semibold text-slate-400">{roleMeta[role].short}</span>
                  </span>
                  <ChevronDown className="size-3.5 text-slate-400" />
                </button>
                {roleOpen && (
                  <div className="absolute end-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-pop">
                    <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">تبديل الحساب التجريبي</p>
                    {roleOrder.map((r) => {
                      const meta = roleMeta[r]
                      const demoUser =
                        r === 'super_admin' ? db.superAdmins[0] : r === 'manager' ? db.managers[0] : r === 'teacher' ? db.teachers[0] : r === 'student' ? db.students[0] : db.parents[0]
                      return (
                        <button
                          key={r}
                          onClick={() => handleSwitch(r)}
                          className={cn('flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-start transition hover:bg-slate-50', r === role && 'bg-brand-50')}
                        >
                          <Avatar name={demoUser?.name ?? meta.label} color={meta.color} size="xs" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-slate-800">{demoUser?.name ?? meta.label}</span>
                            <span className="block text-[10px] text-slate-400">{meta.label}</span>
                          </span>
                          {r === role && <span className="size-1.5 rounded-full bg-brand-500" />}
                        </button>
                      )
                    })}
                    <div className="mt-1 border-t border-slate-100 pt-1">
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50">
                        <LogOut className="size-4" /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {nav.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn('flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold transition', isActive ? 'text-brand-600' : 'text-slate-400')}
            >
              <item.icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
          <button onClick={() => setSidebarOpen(true)} className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-400">
            <Menu className="size-5" /> المزيد
          </button>
        </div>
      </nav>
    </div>
  )
}
