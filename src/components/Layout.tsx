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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {title && (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
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

      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
