import { useStore } from '../lib/store'
import StudentDashboard from './dashboards/StudentDashboard'
import TeacherDashboard from './dashboards/TeacherDashboard'
import ManagerDashboard from './dashboards/ManagerDashboard'
import SuperAdminDashboard from './dashboards/SuperAdminDashboard'
import ParentDashboard from './dashboards/ParentDashboard'

export default function DashboardHome() {
  const { currentUser } = useStore()
  switch (currentUser?.role) {
    case 'super_admin':
      return <SuperAdminDashboard />
    case 'manager':
      return <ManagerDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'parent':
      return <ParentDashboard />
    default:
      return <StudentDashboard />
  }
}
