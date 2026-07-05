import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productosMock, proveedoresMock, ventasMock, pedidosMock, productosConStockBajo } from '../data/mockData';

const modules = [
  {
    title: 'Registrar Producto',
    description: 'Alta de nuevos productos con verificación de proveedor',
    path: '/products/register',
    icon: '📦',
    roles: ['admin'],
  },
  {
    title: 'Registrar Venta',
    description: 'Punto de venta con carrito, cálculo de total y comprobante',
    path: '/sales/register',
    icon: '🧾',
    roles: ['admin', 'empleado'],
  },
  {
    title: 'Ajustar Stock',
    description: 'Ajuste manual de inventario con registro de motivo',
    path: '/stock/adjust',
    icon: '📋',
    roles: ['admin', 'repositor'],
  },
  {
    title: 'Realizar Pedido',
    description: 'Carrito de compras digital con confirmación y comprobante',
    path: '/orders/create',
    icon: '🛒',
    roles: ['cliente'],
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const allowedModules = modules.filter(m =>
    user ? m.roles.includes(user.rol) : false
  );

  const stockBajo = productosConStockBajo();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Bienvenido, {user?.nombreReal}
        </h2>
        <p className="text-slate-500 mt-1">
          Sistema de Gestión — Librería María
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{productosMock.length}</div>
          <div className="text-sm text-slate-500">Productos</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">{proveedoresMock.length}</div>
          <div className="text-sm text-slate-500">Proveedores</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-purple-600">{ventasMock.length}</div>
          <div className="text-sm text-slate-500">Ventas registradas</div>
        </div>
        <div className={`bg-white rounded-xl border p-4 ${stockBajo.length > 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
          <div className={`text-2xl font-bold ${stockBajo.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>
            {stockBajo.length}
          </div>
          <div className="text-sm text-slate-500">Alertas de stock bajo</div>
        </div>
      </div>

      {/* Módulos */}
      <h3 className="text-md font-semibold text-slate-700 mb-3">Módulos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {allowedModules.map(m => (
          <button
            key={m.path}
            onClick={() => navigate(m.path)}
            className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <div className="text-4xl mb-3">{m.icon}</div>
            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {m.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{m.description}</p>
          </button>
        ))}
      </div>

      {/* Alertas y pedidos pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
        {stockBajo.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-700 mb-2">⚠️ Productos con stock bajo</h4>
            <div className="space-y-1">
              {stockBajo.map(p => (
                <div key={p.codigo} className="text-sm text-red-600 flex justify-between">
                  <span>{p.nombre}</span>
                  <span className="font-medium">{p.stockActual} / {p.stockMinimo} mín.</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pedidosMock.filter(p => p.estado === 'Pendiente').length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-700 mb-2">📋 Pedidos pendientes</h4>
            <div className="space-y-1">
              {pedidosMock.filter(p => p.estado === 'Pendiente').map(p => (
                <div key={p.id} className="text-sm text-yellow-600 flex justify-between">
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
