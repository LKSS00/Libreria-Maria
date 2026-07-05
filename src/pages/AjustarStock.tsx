import { useState } from 'react';
import { productosMock, buscarProductos, movimientosStockMock } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, MovimientoStock } from '../types';
import { Search, ClipboardList, Plus, Minus, CheckCircle, History } from 'lucide-react';

export default function AjustarStock() {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verMovimientos, setVerMovimientos] = useState(false);

  const handleBuscar = () => {
    if (!busqueda.trim()) return;
    setResultados(buscarProductos(busqueda));
  };

  const seleccionarProducto = (p: Producto) => {
    setSeleccionado(p);
    setResultados([]);
    setBusqueda('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const cant = parseInt(cantidad);
    if (!seleccionado) { setError('Seleccione un producto.'); return; }
    if (!cant || cant < 1) { setError('Ingrese una cantidad válida.'); return; }
    if (!motivo.trim()) { setError('Indique el motivo del ajuste.'); return; }
    if (tipo === 'egreso' && cant > seleccionado.stockActual) { setError(`Stock insuficiente. Actual: ${seleccionado.stockActual}`); return; }

    const p = productosMock.find(pr => pr.codigo === seleccionado.codigo);
    if (!p) return;
    const cantidadAnterior = p.stockActual;
    const diferencia = tipo === 'ingreso' ? cant : -cant;
    p.stockActual += diferencia;

    movimientosStockMock.push({
      id: movimientosStockMock.length + 1,
      idProducto: p.codigo,
      cantidadAnterior,
      cantidadNueva: p.stockActual,
      motivo: motivo.trim(),
      idUsuario: user?.id ?? 0,
      fecha: new Date(),
    });

    setSuccess(`Stock actualizado: "${p.nombre}" ${tipo === 'ingreso' ? `+${cant}` : `-${cant}`} → ${p.stockActual} unidades.`);
    setCantidad('');
    setMotivo('');
  };

  const nuevoAjuste = () => {
    setSeleccionado(null); setCantidad(''); setMotivo(''); setTipo('ingreso'); setError(''); setSuccess('');
  };

  const productoPorCodigo = (codigo: string) => productosMock.find(p => p.codigo === codigo);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Ajustar Stock</h2>
          </div>
          <button onClick={() => setVerMovimientos(!verMovimientos)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <History size={16} /> {verMovimientos ? 'Ocultar movimientos' : 'Ver movimientos'}
          </button>
        </div>

        {verMovimientos && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Movimientos registrados ({movimientosStockMock.length})</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr><th className="text-left px-3 py-2">Fecha</th><th className="text-left px-3 py-2">Producto</th><th className="text-right px-3 py-2">Anterior</th><th className="text-right px-3 py-2">Nuevo</th><th className="text-left px-3 py-2">Motivo</th></tr>
                </thead>
                <tbody>{movimientosStockMock.map((m: MovimientoStock) => {
                  const prod = productoPorCodigo(m.idProducto);
                  return (
                    <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 text-xs">{m.fecha.toLocaleString('es-AR')}</td>
                      <td className="px-3 py-2">{prod?.nombre ?? m.idProducto}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{m.cantidadAnterior}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{m.cantidadNueva}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{m.motivo}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 1: Buscar */}
        {!seleccionado && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar producto</label>
            <div className="flex gap-2 mb-4">
              <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar por nombre o código..." className="flex-1 max-w-md px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              <button onClick={handleBuscar} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"><Search size={16} /> Buscar</button>
            </div>
            {resultados.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {resultados.map(p => (
                  <div key={p.codigo} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => seleccionarProducto(p)}>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{p.nombre}</p>
                      <p className="text-xs text-slate-500">Cód: {p.codigo} | Stock: {p.stockActual} | Mín: {p.stockMinimo}</p>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">${p.precioVenta.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
            {!resultados.length && <p className="text-sm text-slate-400 text-center py-4">Busque un producto para ajustar su stock.</p>}
          </div>
        )}

        {/* Step 2: Ajustar */}
        {seleccionado && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-800 mb-2">Producto seleccionado: <strong>{seleccionado.nombre}</strong></p>
              <p className="text-xs text-slate-500">Stock actual: <strong className={seleccionado.stockActual <= seleccionado.stockMinimo ? 'text-red-600' : ''}>{seleccionado.stockActual}</strong> | Mínimo: {seleccionado.stockMinimo}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de ajuste <span className="text-red-500">*</span></label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo" value="ingreso" checked={tipo === 'ingreso'} onChange={() => setTipo('ingreso')} className="accent-blue-600" />
                    <span className="text-sm flex items-center gap-1"><Plus size={14} className="text-green-600" /> Ingreso</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo" value="egreso" checked={tipo === 'egreso'} onChange={() => setTipo('egreso')} className="accent-blue-600" />
                    <span className="text-sm flex items-center gap-1"><Minus size={14} className="text-red-600" /> Egreso</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad <span className="text-red-500">*</span></label>
                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0" min="1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo del ajuste <span className="text-red-500">*</span></label>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Rotura de stock, error de inventario, devolución..." rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" />
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"><CheckCircle size={16} /> {success}</div>}

            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                <CheckCircle size={16} /> Aplicar Ajuste
              </button>
              <button type="button" onClick={nuevoAjuste} className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                Nuevo ajuste
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="text-xs text-slate-400 text-center font-mono">Contrato: ajustarStock(idProducto, cantidad, tipo, motivo, idResponsable) — UC-10</div>
    </div>
  );
}
