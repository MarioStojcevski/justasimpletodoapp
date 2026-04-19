import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { TodayPage } from './pages/TodayPage'
import { BoardPage } from './pages/BoardPage'
import { PlanPage } from './pages/PlanPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/dashboard" element={<Navigate to="/today" replace />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/planning" element={<Navigate to="/plan" replace />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  )
}
