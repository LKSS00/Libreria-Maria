import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products/register': 'Registrar Producto',
  '/sales/register': 'Registrar Venta',
  '/stock/adjust': 'Ajustar Stock',
  '/orders/create': 'Realizar Pedido',
};

export default function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Librería María';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <div className="text-sm text-slate-500">
        {new Date().toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </header>
  );
}
