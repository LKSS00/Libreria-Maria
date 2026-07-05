import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrarProducto from './pages/RegistrarProducto';
import RegistrarVenta from './pages/RegistrarVenta';
import AjustarStock from './pages/AjustarStock';
import RealizarPedido from './pages/RealizarPedido';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products/register" element={<RegistrarProducto />} />
            <Route path="/sales/register" element={<RegistrarVenta />} />
            <Route path="/stock/adjust" element={<AjustarStock />} />
            <Route path="/orders/create" element={<RealizarPedido />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
