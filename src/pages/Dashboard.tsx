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
  ArrowRight,
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
    <div className="h-full flex flex-col gap-5">
      {/* Bienvenida + tarjetas resumen */}
      <div className="shrink-0 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bienvenido, {user?.nombreReal}</h2>
          <p className="text-slate-500 text-base mt-0.5">Sistema de Gestión — Librería María</p>
        </div>
        <p className="text-base text-slate-400">{new Date().toLocaleTimeString('es-AR')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><Package size={28} /></div>
          <div>
            <div className="text-3xl font-bold text-slate-800">{productosMock.length}</div>
            <div className="text-base text-slate-500">Productos</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-600"><Truck size={28} /></div>
          <div>
            <div className="text-3xl font-bold text-slate-800">{proveedoresMock.length}</div>
            <div className="text-base text-slate-500">Proveedores</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"><Receipt size={28} /></div>
          <div>
            <div className="text-3xl font-bold text-slate-800">{ventasMock.length}</div>
            <div className="text-base text-slate-500">Ventas registradas</div>
          </div>
        </div>
        <div className={`rounded-xl border p-5 flex items-center gap-4 ${stockBajo.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stockBajo.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <div className={`text-3xl font-bold ${stockBajo.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stockBajo.length}</div>
            <div className="text-base text-slate-500">Alertas de stock</div>
          </div>
        </div>
      </div>

      {/* Módulos + alertas */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-5">
        <section className="col-span-8 flex flex-col min-h-0">
          <h3 className="text-base font-semibold text-slate-700 mb-3 uppercase tracking-wide shrink-0">Módulos</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
            {allowedModules.map(m => {
              const Icon = m.icon;
              return (
                <button key={m.path} onClick={() => navigate(m.path)}
                  className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:shadow-md hover:border-blue-300 transition-all group flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon size={26} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{m.title}</h3>
                  <p className="text-base text-slate-500 mt-1">{m.description}</p>
                  <span className="mt-auto pt-4 flex items-center gap-1 text-base font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ingresar <ArrowRight size={16} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="col-span-4 flex flex-col gap-5 min-h-0">
          {stockBajo.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <Bell size={18} className="text-red-600" />
                <h4 className="font-semibold text-red-700 text-base">Productos con stock bajo</h4>
              </div>
              <div className="space-y-2 overflow-y-auto">
                {stockBajo.map(p => (
                  <div key={p.codigo} className="flex justify-between text-base text-red-600 bg-white/60 rounded-lg px-3 py-2">
                    <span className="truncate">{p.nombre} — {p.subcategoria}</span>
                    <span className="font-medium tabular-nums shrink-0 ml-2">{p.stockActual} / {p.stockMinimo} mín.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pedidosPendientes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <FileWarning size={18} className="text-yellow-600" />
                <h4 className="font-semibold text-yellow-700 text-base">Pedidos pendientes</h4>
              </div>
              <div className="space-y-2 overflow-y-auto">
                {pedidosPendientes.map(p => (
                  <div key={p.id} className="flex justify-between text-base text-yellow-600 bg-white/60 rounded-lg px-3 py-2">
                    <span>N° {p.id} — {p.cliente.nombre}</span>
                    <span className="font-medium shrink-0 ml-2">${p.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
