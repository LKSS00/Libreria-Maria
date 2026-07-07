import { useState } from 'react';
import { productosMock, buscarProductos, ventasMock } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, DetalleVenta } from '../types';
import { Search, Plus, Minus, Trash2, Receipt, History, CreditCard, CheckCircle, Printer, Download } from 'lucide-react';
import { generarPDF, imprimirComprobante } from '../utils/pdfComprobante';

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
    setResultados(buscarProductos(busqueda).filter(p => p.stockActual > 0));
  };

  const agregarItem = (p: Producto) => {
    setError('');
    const existente = items.find(i => i.producto.codigo === p.codigo);
    if (existente) {
      if (existente.cantidad + 1 > p.stockActual) { setError(`Stock insuficiente. Disponible: ${p.stockActual}`); return; }
      setItems(items.map(i => i.producto.codigo === p.codigo ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioCongelado } : i));
    } else {
      if (1 > p.stockActual) { setError(`Stock insuficiente para "${p.nombre} — ${p.subcategoria}".`); return; }
      setItems([...items, { producto: p, cantidad: 1, precioCongelado: p.precioVenta, subtotal: p.precioVenta }]);
    }
    setBusqueda(''); setResultados([]);
  };

  const cambiarCantidad = (codigo: string, nuevaCant: number) => {
    setError('');
    if (nuevaCant < 1) { setItems(items.filter(i => i.producto.codigo !== codigo)); return; }
    const p = items.find(i => i.producto.codigo === codigo);
    if (p && nuevaCant > p.producto.stockActual) { setError(`Stock insuficiente. Máximo: ${p.producto.stockActual}`); return; }
    setItems(items.map(i => i.producto.codigo === codigo ? { ...i, cantidad: nuevaCant, subtotal: nuevaCant * i.precioCongelado } : i));
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const confirmarVenta = () => {
    setError('');
    if (items.length === 0) { setError('Agregue al menos un producto.'); return; }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (!p || p.stockActual < item.cantidad) { setError(`Stock insuficiente para "${item.producto.nombre} — ${item.producto.subcategoria}".`); return; }
    }
    for (const item of items) { const p = productosMock.find(pr => pr.codigo === item.producto.codigo); if (p) p.stockActual -= item.cantidad; }
    setMostrarComprobante(true);
  };

  const nuevaVenta = () => { setItems([]); setMedioPago('efectivo'); setClienteDni(''); setMostrarComprobante(false); setError(''); setBusqueda(''); setResultados([]); };

  if (mostrarComprobante) {
    const nroVenta = Math.floor(Math.random() * 9000) + 1000;

    const handleDownloadPDF = () => {
      generarPDF({
        titulo: 'COMPROBANTE DE VENTA',
        numero: nroVenta,
        cliente: user?.nombreReal ?? '—',
        items: items.map(i => ({
          producto: `${i.producto.nombre} — ${i.producto.subcategoria}`,
          cantidad: i.cantidad,
          precioUnitario: i.precioCongelado,
          subtotal: i.subtotal,
        })),
        total,
        fecha: new Date(),
        etiquetaCliente: 'Vendedor',
      });
    };

    return (
      <div className="max-w-xl mx-auto">
        <div id="comprobante-print" className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'Times New Roman', serif" }}>Librería María</div>
            <p className="text-xs text-slate-500 mt-1">Av. 9 de Julio 1200 — Apóstoles, Misiones</p>
            <p className="text-xs text-slate-500">Tel: xxx | xxx@gmail.com</p>
            <hr className="my-3 border-t-2 border-slate-800" />
            <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase">Comprobante de Venta</h2>
          </div>
          <div className="text-sm space-y-1 mb-4 pb-3 border-b border-slate-300">
            <div className="flex justify-between">
              <span><strong>N° Venta:</strong> {nroVenta}</span>
              <span><strong>Fecha:</strong> {new Date().toLocaleDateString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Vendedor:</strong> {user?.nombreReal}</span>
              <span><strong>Hora:</strong> {new Date().toLocaleTimeString('es-AR')}</span>
            </div>
            <p><strong>Medio de pago:</strong> {medioPago}</p>
            {clienteDni && <p><strong>Cliente DNI:</strong> {clienteDni}</p>}
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b-2 border-slate-800">
                <th className="text-left py-2 text-xs uppercase tracking-wide">Producto</th>
                <th className="text-center py-2 text-xs uppercase tracking-wide">Cant.</th>
                <th className="text-right py-2 text-xs uppercase tracking-wide">P. Unit.</th>
                <th className="text-right py-2 text-xs uppercase tracking-wide">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.producto.codigo} className="border-b border-slate-200">
                  <td className="py-2">{i.producto.nombre} — {i.producto.subcategoria}</td>
                  <td className="text-center py-2">{i.cantidad}</td>
                  <td className="text-right py-2">${i.precioCongelado.toFixed(2)}</td>
                  <td className="text-right py-2">${i.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3 mb-6">
            <span className="text-sm text-slate-600">Total {items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
            <span className="text-2xl font-bold text-slate-800">${total.toFixed(2)}</span>
          </div>
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2 justify-center no-print"><CheckCircle size={16} /> Venta registrada y stock actualizado.</div>
          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
              <Download size={16} /> Descargar PDF
            </button>
            <button onClick={imprimirComprobante} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={nuevaVenta} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
              Nueva Venta
            </button>
          </div>
          <div className="text-center text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200 no-print">
            <p>Contrato: registrarVenta(listaItems, idEmpleado, idCliente, medioPago) — UC-08</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Receipt size={20} className="text-blue-600" /><h2 className="text-lg font-semibold text-slate-800">Nueva Venta</h2></div>
          <button onClick={() => setVerHistorial(!verHistorial)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <History size={16} /> {verHistorial ? 'Ocultar historial' : 'Ver historial'}
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}

        {verHistorial && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Últimas ventas registradas</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr><th className="text-left px-3 py-2">N°</th><th className="text-left px-3 py-2">Fecha</th><th className="text-left px-3 py-2">Productos</th><th className="text-right px-3 py-2">Total</th><th className="text-left px-3 py-2">Pago</th></tr>
                </thead>
                <tbody>{ventasMock.map(v => (<tr key={v.numero} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-3 py-2 font-mono">{v.numero}</td><td className="px-3 py-2 text-xs">{v.fechaHora.toLocaleString('es-AR')}</td><td className="px-3 py-2">{v.items.map(i => `${i.producto.nombre} — ${i.producto.subcategoria}`).join(', ')}</td><td className="px-3 py-2 text-right font-medium">${v.total.toFixed(2)}</td><td className="px-3 py-2 capitalize">{v.medioPago}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar producto por nombre o código..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          <button onClick={handleBuscar} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"><Search size={16} /> Buscar</button>
        </div>

        {resultados.length > 0 && (
          <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {resultados.map(p => (
              <div key={p.codigo} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => agregarItem(p)}>
                  <div><p className="font-medium text-slate-800 text-sm">{p.nombre} — {p.subcategoria}</p><p className="text-xs text-slate-500">Stock: {p.stockActual} | Cód: {p.codigo}</p></div>
                <div className="text-right"><p className="font-semibold text-blue-600">${p.precioVenta.toFixed(2)}</p><p className="text-xs text-green-600 flex items-center gap-0.5"><Plus size={12} /> agregar</p></div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mb-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200"><th className="text-left py-2">Producto</th><th className="text-center py-2">Cantidad</th><th className="text-right py-2">P. Unit.</th><th className="text-right py-2">Subtotal</th><th className="w-10"></th></tr></thead>
              <tbody>{items.map(i => (
                <tr key={i.producto.codigo} className="border-b border-slate-100">
                  <td className="py-2 text-sm">{i.producto.nombre} — {i.producto.subcategoria}</td>
                  <td className="text-center py-2">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad - 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Minus size={14} /></button>
                      <span className="w-8 text-center font-medium text-sm tabular-nums">{i.cantidad}</span>
                      <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad + 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Plus size={14} /></button>
                    </div>
                  </td>
                  <td className="text-right py-2 text-sm tabular-nums">${i.precioCongelado.toFixed(2)}</td>
                  <td className="text-right py-2 text-sm tabular-nums font-medium">${i.subtotal.toFixed(2)}</td>
                  <td className="text-center py-2">
                    <button onClick={() => setItems(items.filter(x => x.producto.codigo !== i.producto.codigo))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
            <div className="text-right mt-3 text-xl font-bold text-slate-800 tabular-nums">Total: ${total.toFixed(2)}</div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Medio de pago</label>
              <div className="flex gap-4">
                {['efectivo', 'transferencia', 'tarjeta'].map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="medioPago" value={m} checked={medioPago === m} onChange={e => setMedioPago(e.target.value)} className="accent-blue-600" />
                    <span className="text-sm capitalize flex items-center gap-1"><CreditCard size={14} /> {m}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DNI Cliente <span className="text-slate-400">(opcional)</span></label>
              <input type="text" value={clienteDni} onChange={e => setClienteDni(e.target.value)} placeholder="DNI del cliente" className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <button onClick={confirmarVenta} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-base flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Confirmar Venta — ${total.toFixed(2)}
            </button>
          </div>
        )}

        {items.length === 0 && !resultados.length && (
          <div className="text-center py-8 text-slate-400 text-sm">Busque productos para comenzar la venta.</div>
        )}
      </div>
      <div className="text-xs text-slate-400 text-center font-mono">Contrato: registrarVenta(listaItems, idEmpleado, idCliente, medioPago) — UC-08</div>
    </div>
  );
}
