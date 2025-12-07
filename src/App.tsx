import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/common/Layout'
import LoginPage from './features/auth/pages/LoginPage'
import CrmPage from './features/crm/pages/CrmPage'
import AddMemberPage from './features/crm/pages/AddMemberPage'
import MemberDetailPage from './features/crm/pages/MemberDetailPage'
import CameraPage from './features/camera/pages/CameraPage'
import ResultPage from './features/camera/pages/ResultPage'
import GalleryPage from './features/gallery/pages/GalleryPage'
import GalleryDetailPage from './features/gallery/pages/GalleryDetailPage'
import AdminPage from './features/admin/pages/AdminPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<CrmPage />} />
        <Route path="members/add" element={<AddMemberPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />
        <Route path="camera" element={<CameraPage />} />
        <Route path="camera/result" element={<ResultPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="gallery/:id" element={<GalleryDetailPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
