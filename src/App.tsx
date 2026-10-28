import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useStore } from './lib/store'
import type { Role } from './types'
import AppLayout from './components/AppLayout'
import { Button, Card } from './components/ui'
import Landing from './pages/Landing'
import Login from './pages/Login'
import DashboardHome from './pages/DashboardHome'
import ReelsPage from './pages/reels/ReelsPage'
import TeachersPage from './pages/teachers/TeachersPage'
import TeacherProfilePage from './pages/teachers/TeacherProfilePage'
import StudentsPage from './pages/students/StudentsPage'
import StudentProfilePage from './pages/students/StudentProfilePage'
import ExamsPage from './pages/exams/ExamsPage'
import ExamBuilderPage from './pages/exams/ExamBuilderPage'
import ExamDetailPage from './pages/exams/ExamDetailPage'
import TakeExamPage from './pages/exams/TakeExamPage'
import ResultsPage from './pages/results/ResultsPage'
import ProgressPage from './pages/progress/ProgressPage'
import ChildPage from './pages/children/ChildPage'
import AttendancePage from './pages/attendance/AttendancePage'
import AnnouncementsPage from './pages/announcements/AnnouncementsPage'
import ManageTeachersPage from './pages/manage/ManageTeachersPage'
import ManageParentsPage from './pages/manage/ManageParentsPage'
import ManageClassesPage from './pages/manage/ManageClassesPage'
import ManageSubjectsPage from './pages/manage/ManageSubjectsPage'
import SchoolsPage from './pages/schools/SchoolsPage'
import SchoolDetailPage from './pages/schools/SchoolDetailPage'
import SubscriptionsPage from './pages/subscriptions/SubscriptionsPage'
import PlansPage from './pages/plans/PlansPage'
import AuditPage from './pages/audit/AuditPage'
import SettingsPage from './pages/settings/SettingsPage'
import NotFound from './pages/NotFound'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore()
  const location = useLocation()
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

function RoleRoute({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { currentUser } = useStore()
  if (currentUser && !roles.includes(currentUser.role)) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <ShieldAlert className="size-7" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900">هذه الصفحة غير متاحة لحسابك</h2>
        <p className="mt-1.5 text-xs leading-6 text-slate-500">
          يمكنك التبديل إلى حساب آخر من قائمة الحساب أعلى الصفحة، أو العودة إلى لوحة التحكم.
        </p>
        <a href="/app" className="mt-5 inline-block">
          <Button>العودة للوحة التحكم</Button>
        </a>
      </Card>
    )
  }
  return <>{children}</>
}

const allRoles: Role[] = ['super_admin', 'manager', 'teacher', 'student', 'parent']

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardHome />} />

        <Route path="reels" element={<RoleRoute roles={['manager', 'teacher', 'student']}><ReelsPage /></RoleRoute>} />
        <Route path="teachers" element={<RoleRoute roles={allRoles}><TeachersPage /></RoleRoute>} />
        <Route path="teachers/:id" element={<RoleRoute roles={allRoles}><TeacherProfilePage /></RoleRoute>} />

        <Route path="students" element={<RoleRoute roles={['manager', 'teacher', 'parent']}><StudentsPage /></RoleRoute>} />
        <Route path="students/:id" element={<RoleRoute roles={['manager', 'teacher', 'student', 'parent']}><StudentProfilePage /></RoleRoute>} />

        <Route path="exams" element={<RoleRoute roles={['manager', 'teacher', 'student', 'parent']}><ExamsPage /></RoleRoute>} />
        <Route path="exams/new" element={<RoleRoute roles={['teacher']}><ExamBuilderPage /></RoleRoute>} />
        <Route path="exams/:id" element={<RoleRoute roles={['manager', 'teacher', 'student', 'parent']}><ExamDetailPage /></RoleRoute>} />

        <Route path="results" element={<RoleRoute roles={['manager', 'teacher', 'student', 'parent']}><ResultsPage /></RoleRoute>} />
        <Route path="progress" element={<RoleRoute roles={['student']}><ProgressPage /></RoleRoute>} />
        <Route path="child" element={<RoleRoute roles={['parent']}><ChildPage /></RoleRoute>} />
        <Route path="attendance" element={<RoleRoute roles={['manager', 'teacher', 'student', 'parent']}><AttendancePage /></RoleRoute>} />

        <Route path="announcements" element={<RoleRoute roles={['manager']}><AnnouncementsPage /></RoleRoute>} />

        <Route path="manage/teachers" element={<RoleRoute roles={['manager']}><ManageTeachersPage /></RoleRoute>} />
        <Route path="manage/parents" element={<RoleRoute roles={['manager']}><ManageParentsPage /></RoleRoute>} />
        <Route path="manage/classes" element={<RoleRoute roles={['manager']}><ManageClassesPage /></RoleRoute>} />
        <Route path="manage/subjects" element={<RoleRoute roles={['manager']}><ManageSubjectsPage /></RoleRoute>} />

        <Route path="schools" element={<RoleRoute roles={['super_admin']}><SchoolsPage /></RoleRoute>} />
        <Route path="schools/:id" element={<RoleRoute roles={['super_admin']}><SchoolDetailPage /></RoleRoute>} />
        <Route path="subscriptions" element={<RoleRoute roles={['super_admin']}><SubscriptionsPage /></RoleRoute>} />
        <Route path="plans" element={<RoleRoute roles={['super_admin']}><PlansPage /></RoleRoute>} />
        <Route path="audit" element={<RoleRoute roles={['super_admin']}><AuditPage /></RoleRoute>} />

        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="/exam/:id"
        element={
          <RequireAuth>
            <RoleRoute roles={['student']}>
              <TakeExamPage />
            </RoleRoute>
          </RequireAuth>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
