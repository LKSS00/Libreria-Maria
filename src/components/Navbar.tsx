import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import {
  LayoutDashboard,
  Package,
  Receipt,
  ClipboardList,
  ShoppingCart,
  LogOut,
  User,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'empleado', 'repositor', 'cliente'] },
  { path: '/products/register', label: 'Registrar Producto', icon: Package, roles: ['admin'] },
  { path: '/sales/register', label: 'Registrar Venta', icon: Receipt, roles: ['admin', 'empleado'] },
  { path: '/stock/adjust', label: 'Ajustar Stock', icon: ClipboardList, roles: ['admin', 'repositor'] },
  { path: '/orders/create', label: 'Realizar Pedido', icon: ShoppingCart, roles: ['cliente'] },
];

export default function Navbar() {
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
    <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1"
        >
          <Logo size={28} />
        </button>

        <div className="hidden md:flex items-center gap-1">
          {allowedItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User size={16} className="text-slate-400" />
              <span className="hidden sm:inline">{user.nombreReal}</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded capitalize">
                {user.rol}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
