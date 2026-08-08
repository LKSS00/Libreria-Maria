import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products/register': 'Registrar Producto',
  '/sales/register': 'Registrar Venta',
  '/stock/adjust': 'Ajustar Stock',
  '/orders/create': 'Realizar Pedido',
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '';

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Navbar />

      {title && (
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 overflow-hidden p-5">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
