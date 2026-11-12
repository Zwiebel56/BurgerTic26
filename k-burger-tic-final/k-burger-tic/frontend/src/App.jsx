import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import PlatoDetalle from './pages/PlatoDetalle';
import Checkout from './pages/Checkout';
import MisPedidos from './pages/MisPedidos';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPlatos from './pages/admin/Platos';
import AdminPedidos from './pages/admin/Pedidos';

const NotFound = () => (
  <div className="py-24 text-center">
    <p className="text-6xl">🍜</p>
    <h1 className="mt-4 text-3xl font-bold text-white">404 · Esta página se enfrió</h1>
    <Link to="/" className="btn-neon mt-6">Volver al inicio</Link>
  </div>
);

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/plato/:id" element={<PlatoDetalle />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-pedidos" element={<ProtectedRoute><MisPedidos /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/platos" element={<ProtectedRoute admin><AdminPlatos /></ProtectedRoute>} />
          <Route path="/admin/pedidos" element={<ProtectedRoute admin><AdminPedidos /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} K-Burger TIC · Street food coreano & fusión asiática
      </footer>
    </>
  );
}
