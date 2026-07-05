import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'empleado', 'repositor', 'cliente'] },
  { path: '/products/register', label: 'Registrar Producto', icon: '📦', roles: ['admin'] },
  { path: '/sales/register', label: 'Registrar Venta', icon: '🧾', roles: ['admin', 'empleado'] },
  { path: '/stock/adjust', label: 'Ajustar Stock', icon: '📋', roles: ['admin', 'repositor'] },
  { path: '/orders/create', label: 'Realizar Pedido', icon: '🛒', roles: ['cliente'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allowedItems = menuItems.filter(item =>
    user ? item.roles.includes(user.rol) : false
  );

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold">Librería María</h2>
        <p className="text-sm text-slate-400 mt-1">{user?.nombreReal}</p>
        <span className="inline-block mt-1 text-xs bg-blue-600 px-2 py-0.5 rounded capitalize">
          {user?.rol}
        </span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {allowedItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-3"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
