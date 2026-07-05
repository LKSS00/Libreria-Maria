import { useState } from 'react';
import { productosMock, buscarProductos, ventasMock } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, DetalleVenta } from '../types';

export default function RegistrarVenta() {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [items, setItems] = useState<DetalleVenta[]>([]);
  const [medioPago, setMedioPago] = useState('efectivo');
  const [clienteDni, setClienteDni] = useState('');
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [error, setError] = useState('');
  const [verHistorial, setVerHistorial] = useState(false);

  const handleBuscar = () => {
    if (!busqueda.trim()) return;
    const res = buscarProductos(busqueda);
    setResultados(res.filter(p => p.stockActual > 0));
  };

  const agregarItem = (p: Producto) => {
    setError('');
    const existente = items.find(i => i.producto.codigo === p.codigo);
    if (existente) {
      if (existente.cantidad + 1 > p.stockActual) {
        setError(`Stock insuficiente para "${p.nombre}". Disponible: ${p.stockActual}`);
        return;
      }
      setItems(items.map(i =>
        i.producto.codigo === p.codigo
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioCongelado }
          : i
      ));
    } else {
      if (1 > p.stockActual) {
        setError(`Stock insuficiente para "${p.nombre}".`);
        return;
      }
      setItems([...items, {
        producto: p,
        cantidad: 1,
        precioCongelado: p.precioVenta,
        subtotal: p.precioVenta,
      }]);
    }
    setBusqueda('');
    setResultados([]);
  };

  const cambiarCantidad = (codigo: string, nuevaCant: number) => {
    setError('');
    if (nuevaCant < 1) {
      setItems(items.filter(i => i.producto.codigo !== codigo));
      return;
    }
    const p = items.find(i => i.producto.codigo === codigo);
    if (p && nuevaCant > p.producto.stockActual) {
      setError(`Stock insuficiente. Máximo: ${p.producto.stockActual}`);
      return;
    }
    setItems(items.map(i =>
      i.producto.codigo === codigo
        ? { ...i, cantidad: nuevaCant, subtotal: nuevaCant * i.precioCongelado }
        : i
    ));
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const confirmarVenta = () => {
    setError('');
    if (items.length === 0) {
      setError('Agregue al menos un producto a la venta.');
      return;
    }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (!p || p.stockActual < item.cantidad) {
        setError(`Stock insuficiente para "${item.producto.nombre}".`);
        return;
      }
    }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (p) p.stockActual -= item.cantidad;
    }
    setMostrarComprobante(true);
  };

  const nuevaVenta = () => {
    setItems([]);
    setMedioPago('efectivo');
    setClienteDni('');
    setMostrarComprobante(false);
    setError('');
    setBusqueda('');
    setResultados([]);
  };

  if (mostrarComprobante) {
    const nroVenta = Math.floor(Math.random() * 9000) + 1000;
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🧾</div>
            <h2 className="text-lg font-semibold text-slate-800">Comprobante de Venta</h2>
            <p className="text-sm text-slate-500">Librería María</p>
          </div>
          <div className="border-t border-b border-slate-200 py-3 mb-4 text-sm space-y-1">
            <p><strong>N° Venta:</strong> {nroVenta}</p>
            <p><strong>Fecha:</strong> {new Date().toLocaleString('es-AR')}</p>
            <p><strong>Vendedor:</strong> {user?.nombreReal}</p>
            <p><strong>Medio de pago:</strong> {medioPago}</p>
            {clienteDni && <p><strong>Cliente DNI:</strong> {clienteDni}</p>}
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2">Producto</th>
                <th className="text-center py-2">Cant.</th>
                <th className="text-right py-2">P. Unit.</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.producto.codigo} className="border-b border-slate-100">
                  <td className="py-2">{i.producto.nombre}</td>
                  <td className="text-center py-2">{i.cantidad}</td>
                  <td className="text-right py-2">${i.precioCongelado.toFixed(2)}</td>
                  <td className="text-right py-2">${i.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-xl font-bold text-slate-800 mb-6">
            Total: ${total.toFixed(2)}
          </div>
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 text-center">
            Venta registrada y stock actualizado correctamente.
          </div>
          <button onClick={nuevaVenta} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Nueva Venta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Nueva Venta</h2>
          <button onClick={() => setVerHistorial(!verHistorial)} className="text-sm text-blue-600 hover:text-blue-800 underline">
            {verHistorial ? 'Ocultar historial' : 'Ver historial de ventas'}
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}

        {/* Historial de ventas */}
        {verHistorial && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Últimas ventas registradas</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">N°</th>
                    <th className="text-left px-3 py-2">Fecha</th>
                    <th className="text-left px-3 py-2">Productos</th>
                    <th className="text-right px-3 py-2">Total</th>
                    <th className="text-left px-3 py-2">Pago</th>
                    <th className="text-left px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasMock.map(v => (
                    <tr key={v.numero} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{v.numero}</td>
                      <td className="px-3 py-2 text-xs">{v.fechaHora.toLocaleString('es-AR')}</td>
                      <td className="px-3 py-2">{v.items.map(i => i.producto.nombre).join(', ')}</td>
                      <td className="px-3 py-2 text-right font-medium">${v.total.toFixed(2)}</td>
                      <td className="px-3 py-2 capitalize">{v.medioPago}</td>
                      <td className="px-3 py-2"><span className="text-green-600">{v.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="flex gap-2 mb-4">
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar producto por nombre o código..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={handleBuscar} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Buscar</button>
        </div>

        {resultados.length > 0 && (
          <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden">
            {resultados.map(p => (
              <div key={p.codigo} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => agregarItem(p)}>
                <div>
                  <p className="font-medium text-slate-800">{p.nombre}</p>
                  <p className="text-xs text-slate-500">Stock: {p.stockActual} | Cód: {p.codigo}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">${p.precioVenta.toFixed(2)}</p>
                  <p className="text-xs text-green-600">Click para agregar</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Productos en venta:</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-center py-2">Cantidad</th>
                  <th className="text-right py-2">P. Unit.</th>
                  <th className="text-right py-2">Subtotal</th>
                  <th className="text-center py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.producto.codigo} className="border-b border-slate-100">
                    <td className="py-2">{i.producto.nombre}</td>
                    <td className="text-center py-2">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad - 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200">-</button>
                        <span className="w-8 text-center font-medium">{i.cantidad}</span>
                        <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad + 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200">+</button>
                      </div>
                    </td>
                    <td className="text-right py-2">${i.precioCongelado.toFixed(2)}</td>
                    <td className="text-right py-2">${i.subtotal.toFixed(2)}</td>
                    <td className="text-center py-2">
                      <button onClick={() => setItems(items.filter(x => x.producto.codigo !== i.producto.codigo))} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-3 text-xl font-bold text-slate-800">Total: ${total.toFixed(2)}</div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medio de pago</label>
              <div className="flex gap-4">
                {['efectivo', 'transferencia', 'tarjeta'].map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="medioPago" value={m} checked={medioPago === m} onChange={e => setMedioPago(e.target.value)} className="accent-blue-600" />
                    <span className="text-sm capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DNI Cliente <span className="text-slate-400">(opcional)</span></label>
              <input type="text" value={clienteDni} onChange={e => setClienteDni(e.target.value)} placeholder="DNI del cliente" className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button onClick={confirmarVenta} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-lg">
              Confirmar Venta — ${total.toFixed(2)}
            </button>
          </div>
        )}

        {items.length === 0 && !resultados.length && (
          <div className="text-center py-8 text-slate-400">Busque productos para comenzar la venta.</div>
        )}
      </div>
      <div className="text-xs text-slate-400 text-center">
        Contrato: registrarVenta(listaItems, idEmpleado, idCliente, medioPago) — UC-08 Registrar Venta
      </div>
    </div>
  );
}
