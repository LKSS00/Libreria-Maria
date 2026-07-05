import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productosMock, proveedoresMock, ventasMock, pedidosMock, productosConStockBajo } from '../data/mockData';
import {
  Package,
  Truck,
  Receipt,
  AlertTriangle,
  PackagePlus,
  ClipboardList,
  ShoppingCart,
  FileWarning,
  Bell,
} from 'lucide-react';

const modules = [
  { title: 'Registrar Producto', description: 'Alta de nuevos productos con verificación de proveedor', path: '/products/register', icon: PackagePlus, roles: ['admin'] },
  { title: 'Registrar Venta', description: 'Punto de venta con carrito, cálculo de total y comprobante', path: '/sales/register', icon: Receipt, roles: ['admin', 'empleado'] },
  { title: 'Ajustar Stock', description: 'Ajuste manual de inventario con registro de motivo', path: '/stock/adjust', icon: ClipboardList, roles: ['admin', 'repositor'] },
  { title: 'Realizar Pedido', description: 'Carrito de compras digital con confirmación', path: '/orders/create', icon: ShoppingCart, roles: ['cliente'] },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allowedModules = modules.filter(m => user ? m.roles.includes(user.rol) : false);
  const stockBajo = productosConStockBajo();
  const pedidosPendientes = pedidosMock.filter(p => p.estado === 'Pendiente');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Bienvenido, {user?.nombreReal}</h2>
        <p className="text-slate-500 text-sm mt-0.5">Sistema de Gestión — Librería María</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Package size={20} /></div>
          <div><div className="text-2xl font-bold text-slate-800">{productosMock.length}</div><div className="text-sm text-slate-500">Productos</div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><Truck size={20} /></div>
          <div><div className="text-2xl font-bold text-slate-800">{proveedoresMock.length}</div><div className="text-sm text-slate-500">Proveedores</div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"><Receipt size={20} /></div>
          <div><div className="text-2xl font-bold text-slate-800">{ventasMock.length}</div><div className="text-sm text-slate-500">Ventas registradas</div></div>
        </div>
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${stockBajo.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stockBajo.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle size={20} />
          </div>
          <div><div className={`text-2xl font-bold ${stockBajo.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stockBajo.length}</div><div className="text-sm text-slate-500">Alertas de stock</div></div>
        </div>
      </div>

      {/* Modules */}
      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Módulos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {allowedModules.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.path} onClick={() => navigate(m.path)}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{m.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{m.description}</p>
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stockBajo.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-red-600" />
              <h4 className="font-semibold text-red-700 text-sm">Productos con stock bajo</h4>
            </div>
            <div className="space-y-1.5">
              {stockBajo.map(p => (
                <div key={p.codigo} className="flex justify-between text-sm text-red-600">
                  <span>{p.nombre}</span>
                  <span className="font-medium tabular-nums">{p.stockActual} / {p.stockMinimo} mín.</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pedidosPendientes.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileWarning size={16} className="text-yellow-600" />
              <h4 className="font-semibold text-yellow-700 text-sm">Pedidos pendientes</h4>
            </div>
            <div className="space-y-1.5">
              {pedidosPendientes.map(p => (
                <div key={p.id} className="flex justify-between text-sm text-yellow-600">
                  <span>N° {p.id} — {p.cliente.nombre}</span>
                  <span className="font-medium">${p.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
