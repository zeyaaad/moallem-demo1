import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Announcement, AttendanceRecord, AttendanceStatus, Exam, ExamAttempt, GradeLevel, Notification, Parent, Reel, Role,
  School, SchoolClass, Student, Subject, Subscription, Teacher, User,
} from '../types'
import {
  allUsers, classes as seedClasses, demoAccounts, gradeLevels as seedGrades, managers as seedManagers,
  parents as seedParents, schools as seedSchools, students as seedStudents, subjects as seedSubjects,
  superAdmins as seedSuperAdmins, teachers as seedTeachers,
} from '../data/users'
import {
  announcements as seedAnnouncements, attempts as seedAttempts, attendance as seedAttendance,
  auditLog as seedAudit, exams as seedExams, notifications as seedNotifications,
  reels as seedReels, subscriptions as seedSubscriptions,
} from '../data/content'

export interface DB {
  schools: School[]
  gradeLevels: GradeLevel[]
  classes: SchoolClass[]
  subjects: Subject[]
  teachers: Teacher[]
  students: Student[]
  parents: Parent[]
  managers: User[]
  superAdmins: User[]
  reels: Reel[]
  exams: Exam[]
  attempts: ExamAttempt[]
  attendance: AttendanceRecord[]
  notifications: Notification[]
  subscriptions: Subscription[]
  announcements: Announcement[]
  auditLog: typeof seedAudit
}

function cloneSubs() {
  return seedSubscriptions.map((s) => ({ ...s }))
}

const seedDB: DB = {
  schools: seedSchools.map((s) => ({ ...s })),
  gradeLevels: seedGrades.map((s) => ({ ...s })),
  classes: seedClasses.map((s) => ({ ...s })),
  subjects: seedSubjects.map((s) => ({ ...s })),
  teachers: seedTeachers.map((s) => ({ ...s })),
  students: seedStudents.map((s) => ({ ...s })),
  parents: seedParents.map((s) => ({ ...s })),
  managers: seedManagers.map((s) => ({ ...s })),
  superAdmins: seedSuperAdmins.map((s) => ({ ...s })),
  reels: seedReels.map((s) => ({ ...s })),
  exams: seedExams.map((s) => ({ ...s })),
  attempts: seedAttempts.map((s) => ({ ...s })),
  attendance: seedAttendance.map((s) => ({ ...s })),
  notifications: seedNotifications.map((s) => ({ ...s })),
  subscriptions: cloneSubs(),
  announcements: seedAnnouncements.map((s) => ({ ...s })),
  auditLog: seedAudit.map((s) => ({ ...s })),
}

const DB_KEY = 'moallem_db_v2'
const SESSION_KEY = 'moallem_session_v2'

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DB>
      if (parsed.students && parsed.exams && parsed.schools) return { ...seedDB, ...parsed } as DB
    }
  } catch {
    /* ignore corrupted storage */
  }
  return seedDB
}

const uid = (prefix: string) =>
  `${prefix}_${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`

interface NewStudent {
  name: string
  email: string
  phone: string
  classId: string
  parentId: string
}

interface NewTeacher {
  name: string
  email: string
  phone: string
  subjectIds: string[]
  classIds: string[]
  experienceYears: number
}

interface NewParent {
  name: string
  email: string
  phone: string
  job: string
}

interface NewExam {
  title: string
  description: string
  subjectId: string
  classId: string
  durationMin: number
  questions: Exam['questions']
  source: 'manual' | 'ai'
  materials?: string[]
}

interface StoreValue {
  db: DB
  currentUser: User | null
  school: School | null
  login: (role: Role) => User
  logout: () => void
  resetDemo: () => void
  notify: (title: string, body?: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addSchool: (data: { name: string; city: string; plan: School['plan']; managerName: string; email: string; phone: string }) => School
  updateSchool: (id: string, patch: Partial<School>) => void
  addStudent: (data: NewStudent) => Student
  updateStudent: (id: string, patch: Partial<Student>) => void
  deleteStudent: (id: string) => void
  addTeacher: (data: NewTeacher) => Teacher
  updateTeacher: (id: string, patch: Partial<Teacher>) => void
  deleteTeacher: (id: string) => void
  addParent: (data: NewParent) => Parent
  updateParent: (id: string, patch: Partial<Parent>) => void
  deleteParent: (id: string) => void
  addClass: (data: { name: string; gradeLevelId: string; room: string; supervisorId: string }) => SchoolClass
  addGradeLevel: (name: string) => GradeLevel
  addSubject: (data: { name: string; teacherId: string; gradeLevelId: string; color: string }) => Subject
  addReel: (data: { title: string; description: string; subjectId: string; emoji: string; gradient: string; duration: number }) => Reel
  addExam: (data: NewExam) => Exam
  publishExam: (id: string) => void
  deleteExam: (id: string) => void
  submitAttempt: (examId: string, answers: Record<string, number>, timeSpentMin: number) => ExamAttempt | null
  markAttendance: (classId: string, date: string, records: Record<string, AttendanceStatus>) => void
  addAnnouncement: (data: { title: string; body: string; audience: string }) => Announcement
  updateSubscription: (id: string, patch: Partial<Subscription>) => void
  getTeacher: (id: string) => Teacher | undefined
  getStudent: (id: string) => Student | undefined
  getParent: (id: string) => Parent | undefined
  getClass: (id: string) => SchoolClass | undefined
  getGrade: (id: string) => GradeLevel | undefined
  getSubject: (id: string) => Subject | undefined
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadDB)
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY))

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  }, [db])

  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId)
    else localStorage.removeItem(SESSION_KEY)
  }, [sessionId])

  const all = useMemo(
    () => [...db.superAdmins, ...db.managers, ...db.teachers, ...db.students, ...db.parents],
    [db],
  )
  const currentUser = useMemo(() => all.find((u) => u.id === sessionId) ?? null, [all, sessionId])
  const school = useMemo(
    () => (currentUser ? db.schools.find((s) => s.id === currentUser.schoolId) ?? null : null),
    [currentUser, db.schools],
  )

  const login = useCallback((role: Role) => {
    const id = demoAccounts[role]
    const user = allUsers.find((u) => u.id === id)
    if (!user) throw new Error('Demo account not found')
    setSessionId(id)
    return user
  }, [])

  const logout = useCallback(() => setSessionId(null), [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(DB_KEY)
    localStorage.removeItem(SESSION_KEY)
    setDb(seedDB)
    setSessionId(null)
  }, [])

  const notify = useCallback((title: string, body = '') => {
    setDb((prev) => ({
      ...prev,
      notifications: [
        {
          id: uid('n'), title, body, time: 'الآن', type: 'system', read: false,
          role: currentUser?.role ?? 'student',
        },
        ...prev.notifications,
      ],
      auditLog: [
        { id: uid('au'), actor: currentUser?.name ?? 'النظام', action: title, target: body, time: 'الآن', type: 'create' },
        ...prev.auditLog,
      ],
    }))
  }, [currentUser])

  const markNotificationRead = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        !currentUser || n.role === currentUser.role ? { ...n, read: true } : n,
      ),
    }))
  }, [currentUser])

  const addSchool: StoreValue['addSchool'] = useCallback((data) => {
    const id = uid('sch')
    const managerId = uid('mgr')
    const school: School = {
      id, name: data.name, shortName: data.name.split(' ').slice(0, 2).join(' '), city: data.city,
      address: data.city, phone: data.phone, email: data.email, logoColor: '#4f46e5',
      managerName: data.managerName, managerId, plan: data.plan, status: 'trial',
      studentsCount: 0, teachersCount: 0, classesCount: 0,
      subscriptionEnd: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      monthlyPrice: data.plan === 'enterprise' ? 18000 : data.plan === 'pro' ? 9500 : 4500,
    }
    const manager: User = {
      id: managerId, role: 'manager', name: data.managerName, email: data.email, phone: data.phone,
      avatarColor: '#0f172a', schoolId: id, status: 'active', createdAt: new Date().toISOString().slice(0, 10),
    }
    setDb((prev) => ({
      ...prev,
      schools: [school, ...prev.schools],
      managers: [manager, ...prev.managers],
      subscriptions: [
        {
          id: uid('sub'), schoolId: id, plan: data.plan, price: school.monthlyPrice,
          startDate: school.createdAt, endDate: school.subscriptionEnd, status: 'trial',
          seats: 0, autoRenew: true,
        },
        ...prev.subscriptions,
      ],
    }))
    return school
  }, [])

  const updateSchool: StoreValue['updateSchool'] = useCallback((id, patch) => {
    setDb((prev) => ({ ...prev, schools: prev.schools.map((s) => (s.id === id ? { ...s, ...patch } : s)) }))
  }, [])

  const addStudent: StoreValue['addStudent'] = useCallback((data) => {
    const cls = db.classes.find((c) => c.id === data.classId)
    const student: Student = {
      id: uid('stu'), role: 'student', name: data.name, email: data.email, phone: data.phone,
      avatarColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)],
      schoolId: school?.id ?? 'sch_1', status: 'active', createdAt: new Date().toISOString().slice(0, 10),
      classId: data.classId, gradeLevelId: cls?.gradeLevelId ?? 'g2', parentId: data.parentId,
      code: `ST-${Math.floor(2600 + Math.random() * 700)}`, points: 0, level: 1, average: 0,
      attendanceRate: 100, rank: 0,
    }
    setDb((prev) => ({
      ...prev,
      students: [student, ...prev.students],
      classes: prev.classes.map((c) => (c.id === data.classId ? { ...c, studentsCount: c.studentsCount + 1 } : c)),
      parents: prev.parents.map((p) =>
        p.id === data.parentId ? { ...p, studentIds: [...p.studentIds, student.id] } : p,
      ),
      schools: prev.schools.map((s) => (s.id === student.schoolId ? { ...s, studentsCount: s.studentsCount + 1 } : s)),
    }))
    return student
  }, [db.classes, school])

  const updateStudent: StoreValue['updateStudent'] = useCallback((id, patch) => {
    setDb((prev) => ({ ...prev, students: prev.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) }))
  }, [])

  const deleteStudent: StoreValue['deleteStudent'] = useCallback((id) => {
    setDb((prev) => ({ ...prev, students: prev.students.filter((s) => s.id !== id) }))
  }, [])

  const addTeacher: StoreValue['addTeacher'] = useCallback((data) => {
    const teacher: Teacher = {
      id: uid('tch'), role: 'teacher', name: data.name, email: data.email, phone: data.phone,
      avatarColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
      schoolId: school?.id ?? 'sch_1', status: 'active', createdAt: new Date().toISOString().slice(0, 10),
      subjectIds: data.subjectIds, classIds: data.classIds, bio: '', experienceYears: data.experienceYears,
      rating: 5, studentsCount: 0, reelsCount: 0,
    }
    setDb((prev) => ({
      ...prev,
      teachers: [teacher, ...prev.teachers],
      schools: prev.schools.map((s) => (s.id === teacher.schoolId ? { ...s, teachersCount: s.teachersCount + 1 } : s)),
    }))
    return teacher
  }, [school])

  const updateTeacher: StoreValue['updateTeacher'] = useCallback((id, patch) => {
    setDb((prev) => ({ ...prev, teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  }, [])

  const deleteTeacher: StoreValue['deleteTeacher'] = useCallback((id) => {
    setDb((prev) => ({ ...prev, teachers: prev.teachers.filter((t) => t.id !== id) }))
  }, [])

  const addParent: StoreValue['addParent'] = useCallback((data) => {
    const parent: Parent = {
      id: uid('par'), role: 'parent', name: data.name, email: data.email, phone: data.phone,
      avatarColor: ['#4f46e5', '#0ea5e9', '#10b981'][Math.floor(Math.random() * 3)],
      schoolId: school?.id ?? 'sch_1', status: 'active', createdAt: new Date().toISOString().slice(0, 10),
      job: data.job, studentIds: [],
    }
    setDb((prev) => ({ ...prev, parents: [parent, ...prev.parents] }))
    return parent
  }, [school])

  const updateParent: StoreValue['updateParent'] = useCallback((id, patch) => {
    setDb((prev) => ({ ...prev, parents: prev.parents.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  }, [])

  const deleteParent: StoreValue['deleteParent'] = useCallback((id) => {
    setDb((prev) => ({ ...prev, parents: prev.parents.filter((p) => p.id !== id) }))
  }, [])

  const addClass: StoreValue['addClass'] = useCallback((data) => {
    const cls: SchoolClass = {
      id: uid('c'), name: data.name, gradeLevelId: data.gradeLevelId, schoolId: school?.id ?? 'sch_1',
      supervisorId: data.supervisorId, room: data.room, studentsCount: 0,
    }
    setDb((prev) => ({
      ...prev,
      classes: [...prev.classes, cls],
      schools: prev.schools.map((s) => (s.id === cls.schoolId ? { ...s, classesCount: s.classesCount + 1 } : s)),
    }))
    return cls
  }, [school])

  const addGradeLevel: StoreValue['addGradeLevel'] = useCallback((name) => {
    const grade: GradeLevel = {
      id: uid('g'), name, order: db.gradeLevels.length + 1, schoolId: school?.id ?? 'sch_1',
    }
    setDb((prev) => ({ ...prev, gradeLevels: [...prev.gradeLevels, grade] }))
    return grade
  }, [db.gradeLevels.length, school])

  const addSubject: StoreValue['addSubject'] = useCallback((data) => {
    const subject: Subject = {
      id: uid('sub'), name: data.name, icon: 'BookOpen', color: data.color,
      gradeLevelId: data.gradeLevelId, schoolId: school?.id ?? 'sch_1', teacherId: data.teacherId,
    }
    setDb((prev) => ({
      ...prev,
      subjects: [...prev.subjects, subject],
      teachers: prev.teachers.map((t) =>
        t.id === data.teacherId ? { ...t, subjectIds: [...t.subjectIds, subject.id] } : t,
      ),
    }))
    return subject
  }, [school])

  const addReel: StoreValue['addReel'] = useCallback((data) => {
    const teacher = db.teachers.find((t) => t.id === sessionId)
    const reel: Reel = {
      id: uid('reel'), teacherId: teacher?.id ?? 'tch_1', subjectId: data.subjectId,
      title: data.title, description: data.description, duration: data.duration,
      views: 0, likes: 0, comments: 0, saves: 0,
      createdAt: new Date().toISOString().slice(0, 10), gradient: data.gradient, emoji: data.emoji,
      tags: [], transcript: [],
    }
    setDb((prev) => ({
      ...prev,
      reels: [reel, ...prev.reels],
      teachers: prev.teachers.map((t) => (t.id === reel.teacherId ? { ...t, reelsCount: t.reelsCount + 1 } : t)),
    }))
    return reel
  }, [db.teachers, sessionId])

  const addExam: StoreValue['addExam'] = useCallback((data) => {
    const teacher = db.teachers.find((t) => t.id === sessionId)
    const exam: Exam = {
      id: uid('ex'), schoolId: school?.id ?? 'sch_1', teacherId: teacher?.id ?? 'tch_1',
      subjectId: data.subjectId, classId: data.classId, title: data.title, description: data.description,
      durationMin: data.durationMin, totalMarks: data.questions.reduce((s, q) => s + q.marks, 0),
      questions: data.questions, status: 'published', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10), source: data.source, attempts: 0, averageScore: 0,
      materials: data.materials,
    }
    setDb((prev) => ({ ...prev, exams: [exam, ...prev.exams] }))
    return exam
  }, [db.teachers, school, sessionId])

  const publishExam: StoreValue['publishExam'] = useCallback((id) => {
    setDb((prev) => ({ ...prev, exams: prev.exams.map((e) => (e.id === id ? { ...e, status: 'published' } : e)) }))
  }, [])

  const deleteExam: StoreValue['deleteExam'] = useCallback((id) => {
    setDb((prev) => ({ ...prev, exams: prev.exams.filter((e) => e.id !== id) }))
  }, [])

  const submitAttempt: StoreValue['submitAttempt'] = useCallback((examId, answers, timeSpentMin) => {
    const exam = db.exams.find((e) => e.id === examId)
    if (!exam) return null
    const score = exam.questions.reduce(
      (sum, q) => sum + (answers[q.id] === q.correctIndex ? q.marks : 0), 0,
    )
    const attempt: ExamAttempt = {
      id: uid('att'), examId, studentId: sessionId ?? 'stu_1', score, total: exam.totalMarks,
      answers, submittedAt: new Date().toISOString().slice(0, 10), timeSpentMin,
    }
    setDb((prev) => {
      const nextAttempts = [...prev.attempts, attempt]
      const examAttempts = nextAttempts.filter((a) => a.examId === examId)
      const avg = examAttempts.length
        ? Math.round(examAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / examAttempts.length)
        : 0
      return {
        ...prev,
        attempts: nextAttempts,
        exams: prev.exams.map((e) => (e.id === examId ? { ...e, attempts: examAttempts.length, averageScore: avg } : e)),
        students: prev.students.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                average: Math.round((s.average * 4 + (score / exam.totalMarks) * 100) / 5),
                points: s.points + score * 5,
              }
            : s,
        ),
        notifications: [
          {
            id: uid('n'), title: 'تم تصحيح الامتحان', body: `حصلت على ${score} من ${exam.totalMarks} في «${exam.title}».`,
            time: 'الآن', type: 'grade', read: false, role: 'student',
          },
          ...prev.notifications,
        ],
      }
    })
    return attempt
  }, [db.exams, sessionId])

  const markAttendance: StoreValue['markAttendance'] = useCallback((classId, date, records) => {
    setDb((prev) => {
      const untouched = prev.attendance.filter((a) => !(a.classId === classId && a.date === date))
      const added: AttendanceRecord[] = Object.entries(records).map(([studentId, status]) => ({
        id: uid('attd'), studentId, classId, date, status,
      }))
      return { ...prev, attendance: [...untouched, ...added] }
    })
  }, [])

  const addAnnouncement: StoreValue['addAnnouncement'] = useCallback((data) => {
    const announcement: Announcement = {
      id: uid('an'), schoolId: school?.id ?? 'sch_1', authorName: currentUser?.name ?? 'إدارة المدرسة',
      title: data.title, body: data.body, date: new Date().toISOString().slice(0, 10),
      audience: data.audience,
    }
    setDb((prev) => ({
      ...prev,
      announcements: [announcement, ...prev.announcements],
      notifications: [
        {
          id: uid('n'), title: 'إعلان جديد', body: data.title, time: 'الآن', type: 'system',
          read: false, role: 'student',
        },
        ...prev.notifications,
      ],
    }))
    return announcement
  }, [currentUser, school])

  const updateSubscription: StoreValue['updateSubscription'] = useCallback((id, patch) => {
    setDb((prev) => {
      const subscriptions = prev.subscriptions.map((s) => (s.id === id ? { ...s, ...patch } : s))
      const changed = subscriptions.find((s) => s.id === id)
      return {
        ...prev,
        subscriptions,
        schools: changed
          ? prev.schools.map((sc) =>
              sc.id === changed.schoolId
                ? { ...sc, plan: changed.plan, status: changed.status, subscriptionEnd: changed.endDate, monthlyPrice: changed.price }
                : sc,
            )
          : prev.schools,
      }
    })
  }, [])

  const value = useMemo<StoreValue>(() => ({
    db,
    currentUser,
    school,
    login,
    logout,
    resetDemo,
    notify,
    markNotificationRead,
    markAllNotificationsRead,
    addSchool,
    updateSchool,
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addParent,
    updateParent,
    deleteParent,
    addClass,
    addGradeLevel,
    addSubject,
    addReel,
    addExam,
    publishExam,
    deleteExam,
    submitAttempt,
    markAttendance,
    addAnnouncement,
    updateSubscription,
    getTeacher: (id) => db.teachers.find((t) => t.id === id),
    getStudent: (id) => db.students.find((s) => s.id === id),
    getParent: (id) => db.parents.find((p) => p.id === id),
    getClass: (id) => db.classes.find((c) => c.id === id),
    getGrade: (id) => db.gradeLevels.find((g) => g.id === id),
    getSubject: (id) => db.subjects.find((s) => s.id === id),
  }), [
    db, currentUser, school, login, logout, resetDemo, notify, markNotificationRead, markAllNotificationsRead,
    addSchool, updateSchool, addStudent, updateStudent, deleteStudent, addTeacher, updateTeacher, deleteTeacher,
    addParent, updateParent, deleteParent, addClass, addGradeLevel, addSubject, addReel, addExam, publishExam,
    deleteExam, submitAttempt, markAttendance, addAnnouncement, updateSubscription,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export function useRole() {
  const { currentUser } = useStore()
  return currentUser?.role ?? null
}
