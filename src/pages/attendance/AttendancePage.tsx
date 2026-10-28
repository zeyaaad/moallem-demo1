import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, CalendarCheck, CheckCircle2, Clock, Save, UserX, Users, XCircle,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { AttendanceStatus } from '../../types'
import {
  Avatar, Badge, Button, Card, EmptyState, PageHeader, ProgressBar, StatCard, useToast,
} from '../../components/ui'
import { AttendanceHeatmap } from '../../components/charts'
import { cn, formatDate, todayISO, weekday } from '../../lib/utils'

const statuses: Array<{ value: AttendanceStatus; label: string; short: string; icon: typeof CheckCircle2; active: string }> = [
  { value: 'present', label: 'حاضر', short: 'ح', icon: CheckCircle2, active: 'bg-emerald-500 text-white border-emerald-500' },
  { value: 'late', label: 'متأخر', short: 'ت', icon: Clock, active: 'bg-amber-500 text-white border-amber-500' },
  { value: 'absent', label: 'غائب', short: 'غ', icon: XCircle, active: 'bg-rose-500 text-white border-rose-500' },
  { value: 'excused', label: 'بعذر', short: 'ع', icon: AlertCircle, active: 'bg-sky-500 text-white border-sky-500' },
]

export default function AttendancePage() {
  const { currentUser } = useStore()
  if (currentUser?.role === 'manager' || currentUser?.role === 'teacher') return <StaffAttendance />
  return <ViewerAttendance />
}

/* ------------------------------------------------------------------ */
/* Staff: record attendance                                            */
/* ------------------------------------------------------------------ */

function StaffAttendance() {
  const { currentUser, db, markAttendance, notify } = useStore()
  const { push } = useToast()
  const isTeacher = currentUser?.role === 'teacher'
  const teacher = isTeacher ? db.teachers.find((t) => t.id === currentUser?.id) : undefined
  const myClasses = useMemo(
    () => (isTeacher ? db.classes.filter((c) => teacher?.classIds.includes(c.id)) : db.classes),
    [db.classes, isTeacher, teacher],
  )
  const [classId, setClassId] = useState(myClasses[0]?.id ?? '')
  const [date, setDate] = useState(todayISO())
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({})

  const students = useMemo(
    () => db.students.filter((s) => s.classId === classId).sort((a, b) => a.name.localeCompare(b.name)),
    [classId, db.students],
  )
  const existing = useMemo(
    () => db.attendance.filter((a) => a.classId === classId && a.date === date),
    [classId, date, db.attendance],
  )

  useEffect(() => {
    setRecords(Object.fromEntries(students.map((s) => [s.id, existing.find((a) => a.studentId === s.id)?.status ?? 'present'])))
  }, [students, existing])

  const counts = useMemo(() => ({
    present: Object.values(records).filter((r) => r === 'present').length,
    late: Object.values(records).filter((r) => r === 'late').length,
    absent: Object.values(records).filter((r) => r === 'absent').length,
    excused: Object.values(records).filter((r) => r === 'excused').length,
  }), [records])

  const cls = db.classes.find((c) => c.id === classId)
  const grade = db.gradeLevels.find((g) => g.id === cls?.gradeLevelId)
  const alreadySaved = existing.length > 0

  const setAll = (status: AttendanceStatus) => {
    setRecords(Object.fromEntries(students.map((s) => [s.id, status])))
  }

  const save = () => {
    if (!classId) { push({ title: 'اختر فصلًا أولًا', tone: 'error' }); return }
    if (students.length === 0) { push({ title: 'لا يوجد طلاب في هذا الفصل', tone: 'error' }); return }
    markAttendance(classId, date, records)
    notify('سجّل حضور فصل', `${cls?.name} — ${date}`)
    push({ title: 'تم حفظ الحضور', body: `فصل ${cls?.name} — ${formatDate(date)}`, tone: 'success' })
  }

  return (
    <div>
      <PageHeader
        title="الحضور والغياب"
        subtitle={isTeacher ? 'سجّل حضور طلاب فصولك يوميًا، وتابع الغياب المتكرر.' : 'متابعة حضور كل الفصول والطلاب في المدرسة.'}
        actions={<Badge tone="brand"><CalendarCheck className="size-3" /> {formatDate(date)}</Badge>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="طلاب الفصل" value={students.length} icon={Users} tone="brand" hint={cls?.name ?? 'اختر فصلًا'} />
        <StatCard label="حاضر" value={counts.present} icon={CheckCircle2} tone="emerald" hint={`${Math.round((counts.present / Math.max(1, students.length)) * 100)}%`} />
        <StatCard label="غائب" value={counts.absent} icon={UserX} tone="rose" hint="يحتاج متابعة" />
        <StatCard label="متأخر / بعذر" value={`${counts.late} / ${counts.excused}`} icon={Clock} tone="amber" hint="تسجيل اليوم" />
      </div>

      <Card className="mb-4 flex flex-wrap items-end gap-3 p-3">
        <div className="w-full sm:w-56">
          <label className="label text-[11px]">الفصل</label>
          <select className="select" value={classId} onChange={(e) => setClassId(e.target.value)}>
            {myClasses.map((c) => <option key={c.id} value={c.id}>{c.name} — {db.gradeLevels.find((g) => g.id === c.gradeLevelId)?.name}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="label text-[11px]">التاريخ</label>
          <input type="date" max={todayISO()} className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5 sm:ms-auto">
          <Button size="sm" variant="secondary" onClick={() => setAll('present')}><CheckCircle2 className="size-3.5" /> الكل حاضر</Button>
          <Button size="sm" onClick={save}><Save className="size-3.5" /> حفظ الحضور</Button>
        </div>
      </Card>

      {alreadySaved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-2.5 text-[11px] font-semibold text-sky-800">
          <CheckCircle2 className="size-4" /> يوجد سجل محفوظ لهذا الفصل في هذا التاريخ — التعديل سيستبدل السجل السابق.
        </div>
      )}

      {students.length === 0 ? (
        <Card><EmptyState icon={Users} title="لا يوجد طلاب في هذا الفصل" description="أضف طلابًا إلى الفصل من صفحة الطلاب أولًا." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">فصل {cls?.name} — {grade?.name}</h2>
              <p className="mt-0.5 text-[10px] text-slate-400">{weekday(date)} • {students.length} طالب • نسبة الحضور {Math.round((counts.present / students.length) * 100)}%</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> {counts.present}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> {counts.late}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500" /> {counts.absent}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-sky-500" /> {counts.excused}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="table-head">
                  <th className="px-5 py-3">الطالب</th>
                  <th className="px-3 py-3">المتوسط</th>
                  <th className="px-3 py-3">الحضور العام</th>
                  <th className="px-5 py-3">حالة اليوم</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="transition hover:bg-slate-50/60">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.name} color={student.avatarColor} size="xs" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{student.name}</p>
                          <p className="text-[9px] text-slate-400">{student.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-[11px] text-slate-500">{student.average}%</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={student.attendanceRate} size="sm" className="w-16" tone={student.attendanceRate >= 90 ? 'emerald' : student.attendanceRate >= 75 ? 'amber' : 'rose'} />
                        <span className="text-[10px] font-bold text-slate-500">{student.attendanceRate}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        {statuses.map((s) => {
                          const Icon = s.icon
                          const isActive = records[student.id] === s.value
                          return (
                            <button
                              key={s.value}
                              onClick={() => setRecords((prev) => ({ ...prev, [student.id]: s.value }))}
                              className={cn('flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[10px] font-bold transition', isActive ? s.active : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50')}
                              title={s.label}
                            >
                              <Icon className="size-3" /> {s.label}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <p className="text-[10px] text-slate-400">سيتم إشعار أولياء أمور الغائبين تلقائيًا بعد الحفظ.</p>
            <Button size="sm" onClick={save}><Save className="size-3.5" /> حفظ الحضور</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Student / Parent: view attendance                                   */
/* ------------------------------------------------------------------ */

function ViewerAttendance() {
  const { currentUser, db } = useStore()
  const isParent = currentUser?.role === 'parent'
  const parent = isParent ? db.parents.find((p) => p.id === currentUser?.id) : undefined
  const children = isParent
    ? db.students.filter((s) => parent?.studentIds.includes(s.id))
    : db.students.filter((s) => s.id === currentUser?.id)
  const [childId, setChildId] = useState(children[0]?.id ?? '')
  const child = children.find((c) => c.id === childId) ?? children[0]

  const records = useMemo(
    () => (child ? db.attendance.filter((a) => a.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date)) : []),
    [child, db.attendance],
  )

  const counts = {
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    absent: records.filter((r) => r.status === 'absent').length,
    excused: records.filter((r) => r.status === 'excused').length,
  }
  const rate = child?.attendanceRate ?? 0
  const cls = child ? db.classes.find((c) => c.id === child.classId) : undefined
  const grade = child ? db.gradeLevels.find((g) => g.id === child.gradeLevelId) : undefined

  return (
    <div>
      <PageHeader
        title="الحضور والغياب"
        subtitle={isParent ? 'تابع حضور أبنائك، أيام الغياب، والتأخير أولًا بأول.' : 'سجل حضورك وغيابك خلال الفصل الدراسي.'}
        actions={isParent && children.length > 1 ? (
          <select className="select w-44" value={child?.id} onChange={(e) => setChildId(e.target.value)}>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : <Badge tone="brand"><CalendarCheck className="size-3" /> {formatDate(todayISO())}</Badge>}
      />

      {!child ? (
        <Card><EmptyState icon={Users} title="لا يوجد طالب مرتبط" description="لم يتم ربط حسابك بأي طالب حتى الآن." /></Card>
      ) : (
        <>
          <Card className="mb-5 flex flex-wrap items-center gap-4 p-4">
            <Avatar name={child.name} color={child.avatarColor} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-900">{child.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{grade?.name} • فصل {cls?.name} • {child.code}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400">نسبة الحضور</p>
              <p className={cn('text-xl font-black', rate >= 90 ? 'text-emerald-600' : rate >= 75 ? 'text-amber-600' : 'text-rose-600')}>{rate}%</p>
            </div>
            <div className="w-full sm:w-40"><ProgressBar value={rate} tone={rate >= 90 ? 'emerald' : rate >= 75 ? 'amber' : 'rose'} /></div>
          </Card>

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="أيام الحضور" value={counts.present} icon={CheckCircle2} tone="emerald" />
            <StatCard label="أيام الغياب" value={counts.absent} icon={UserX} tone="rose" hint="خلال ٤٢ يومًا" />
            <StatCard label="مرات التأخير" value={counts.late} icon={Clock} tone="amber" />
            <StatCard label="غياب بعذر" value={counts.excused} icon={AlertCircle} tone="sky" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">خريطة الحضور</h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">آخر ٤٢ يومًا — كل مربع يمثل يومًا</p>
                </div>
                <Badge tone={rate >= 90 ? 'emerald' : 'amber'}>{rate}%</Badge>
              </div>
              <AttendanceHeatmap records={records} days={42} />
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] leading-6 text-slate-500">
                {counts.absent === 0
                  ? 'سجل مثالي! لم يُسجل أي غياب خلال الفترة الماضية.'
                  : `تم تسجيل ${counts.absent} أيام غياب. ${rate < 85 ? 'يُنصح بمراجعة إدارة المدرسة لمعرفة الأسباب.' : 'المعدل ما زال ضمن الحدود المقبولة.'}`}
              </div>
            </Card>

            <Card>
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-slate-900">آخر السجلات</h2>
              </div>
              <div className="max-h-[330px] overflow-y-auto">
                {records.slice(0, 15).map((record) => {
                  const meta = statuses.find((s) => s.value === record.status)!
                  const Icon = meta.icon
                  return (
                    <div key={record.id} className="flex items-center gap-3 border-b border-slate-50 px-5 py-2.5 last:border-0">
                      <span className={cn('flex size-8 items-center justify-center rounded-lg', record.status === 'present' ? 'bg-emerald-50 text-emerald-600' : record.status === 'absent' ? 'bg-rose-50 text-rose-600' : record.status === 'late' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600')}>
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-700">{formatDate(record.date)}</p>
                        <p className="text-[9px] text-slate-400">{weekday(record.date)} • {db.classes.find((c) => c.id === record.classId)?.name}</p>
                      </div>
                      <Badge tone={record.status === 'present' ? 'emerald' : record.status === 'absent' ? 'rose' : record.status === 'late' ? 'amber' : 'sky'}>{meta.label}</Badge>
                    </div>
                  )
                })}
                {records.length === 0 && <p className="px-5 py-10 text-center text-xs text-slate-400">لا توجد سجلات حضور بعد.</p>}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
