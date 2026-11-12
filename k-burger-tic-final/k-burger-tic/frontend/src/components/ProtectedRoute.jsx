import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

// Protección de rutas en el cliente (solo UX): la seguridad real la aplican
// authMiddleware y adminMiddleware en el backend.
export default function ProtectedRoute({ children, admin = false }) {
  const { usuario, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Verificando sesión…" />;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
