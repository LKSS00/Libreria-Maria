import { useState } from 'react';
import { productosMock, buscarProductos, movimientosStockMock } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, MovimientoStock } from '../types';

const motivosAjuste = [
  'Rotura',
  'Robo',
  'Donación',
  'Corrección de conteo',
  'Ingreso proveedor',
];

let movimientoId = movimientosStockMock.length + 1;
const movimientos: MovimientoStock[] = [...movimientosStockMock];

export default function AjustarStock() {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [nuevaCantidad, setNuevaCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [movimientosRecientes, setMovimientosRecientes] = useState<MovimientoStock[]>(movimientosStockMock);
  const [verProductos, setVerProductos] = useState(false);

  const handleBuscar = () => {
    if (!busqueda.trim()) return;
    setResultados(buscarProductos(busqueda));
  };

  const seleccionarProducto = (p: Producto) => {
    setProductoSeleccionado(p);
    setNuevaCantidad(p.stockActual.toString());
    setMotivo('');
    setError('');
    setSuccess('');
    setResultados([]);
    setBusqueda('');
  };

  const confirmarAjuste = () => {
    setError('');
    setSuccess('');
    if (!productoSeleccionado) { setError('Seleccione un producto.'); return; }
    if (!motivo) { setError('Debe seleccionar un motivo de ajuste.'); return; }
    const cant = parseInt(nuevaCantidad);
    if (isNaN(cant) || cant < 0) { setError('Ingrese una cantidad válida (mayor o igual a 0).'); return; }

    const cantidadAnterior = productoSeleccionado.stockActual;
    productoSeleccionado.stockActual = cant;

    const mov: MovimientoStock = {
      id: movimientoId++,
      idProducto: productoSeleccionado.codigo,
      cantidadAnterior,
      cantidadNueva: cant,
      motivo,
      idUsuario: user?.id || 0,
      fecha: new Date(),
    };
    movimientos.push(mov);
    setMovimientosRecientes([mov, ...movimientosRecientes].slice(0, 10));

    setSuccess(`Stock de "${productoSeleccionado.nombre}" actualizado: ${cantidadAnterior} → ${cant}.`);
  };

  const resetForm = () => {
    setProductoSeleccionado(null);
    setNuevaCantidad('');
    setMotivo('');
    setError('');
    setSuccess('');
    setBusqueda('');
    setResultados([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Ajuste Manual de Stock</h2>
          <button onClick={() => setVerProductos(!verProductos)} className="text-sm text-blue-600 hover:text-blue-800 underline">
            {verProductos ? 'Ocultar productos' : 'Ver todos los productos'}
          </button>
        </div>

        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

        {/* Lista completa de productos */}
        {verProductos && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Inventario actual ({productosMock.length} productos)</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Código</th>
                    <th className="text-left px-3 py-2">Nombre</th>
                    <th className="text-right px-3 py-2">Stock Actual</th>
                    <th className="text-right px-3 py-2">Stock Mínimo</th>
                    <th className="text-left px-3 py-2">Estado</th>
                    <th className="text-center px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {productosMock.map(p => {
                    const bajo = p.stockActual <= p.stockMinimo;
                    return (
                      <tr key={p.codigo} className={`border-t border-slate-100 hover:bg-blue-50 ${bajo ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 font-mono text-xs">{p.codigo}</td>
                        <td className="px-3 py-2">{p.nombre}</td>
                        <td className={`px-3 py-2 text-right font-medium ${bajo ? 'text-red-600' : ''}`}>{p.stockActual}</td>
                        <td className="px-3 py-2 text-right">{p.stockMinimo}</td>
                        <td className="px-3 py-2">{bajo ? <span className="text-red-600 text-xs font-medium">⚠ Stock bajo</span> : <span className="text-green-600 text-xs">OK</span>}</td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => seleccionarProducto(p)} className="text-xs text-blue-600 hover:text-blue-800 underline">Ajustar</button>
                        </td>
                      </tr>
                    );
                  })}
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
          <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {resultados.map(p => (
              <div key={p.codigo} className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => seleccionarProducto(p)}>
                <div>
                  <p className="font-medium text-slate-800">{p.nombre}</p>
                  <p className="text-xs text-slate-500">Cód: {p.codigo}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${p.stockActual <= p.stockMinimo ? 'text-red-600' : 'text-green-600'}`}>Stock: {p.stockActual}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {productoSeleccionado && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-500">Producto seleccionado:</p>
              <p className="font-semibold text-slate-800">{productoSeleccionado.nombre}</p>
              <p className="text-xs text-slate-500">Código: {productoSeleccionado.codigo} | Categoría: {productoSeleccionado.categoria}</p>
              <p className="text-sm mt-1">Stock anterior: <strong>{productoSeleccionado.stockActual}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nueva cantidad <span className="text-red-500">*</span></label>
              <input type="number" value={nuevaCantidad} onChange={e => setNuevaCantidad(e.target.value)} min="0" className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setNuevaCantidad(Math.max(0, (parseInt(nuevaCantidad) || 0) - 1).toString())} className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300">-1</button>
                <button type="button" onClick={() => setNuevaCantidad(((parseInt(nuevaCantidad) || 0) + 1).toString())} className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300">+1</button>
                <button type="button" onClick={() => setNuevaCantidad(((parseInt(nuevaCantidad) || 0) + 10).toString())} className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300">+10</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo del ajuste <span className="text-red-500">*</span></label>
              <select value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Seleccione un motivo...</option>
                {motivosAjuste.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
            <div className="flex gap-3">
              <button onClick={confirmarAjuste} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Confirmar Ajuste</button>
              <button onClick={resetForm} className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        {!productoSeleccionado && !resultados.length && !verProductos && (
          <div className="text-center py-8 text-slate-400">Busque un producto o vea el inventario completo para realizar un ajuste.</div>
        )}
      </div>

      {/* Movimientos recientes */}
      {movimientosRecientes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-md font-semibold text-slate-800 mb-3">Historial de movimientos</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-right px-3 py-2">Anterior</th>
                  <th className="text-right px-3 py-2">Nuevo</th>
                  <th className="text-right px-3 py-2">Diferencia</th>
                  <th className="text-left px-3 py-2">Motivo</th>
                  <th className="text-left px-3 py-2">Responsable</th>
                </tr>
              </thead>
              <tbody>
                {movimientosRecientes.map(m => {
                  const diff = m.cantidadNueva - m.cantidadAnterior;
                  return (
                    <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 text-xs">{m.fecha.toLocaleString('es-AR')}</td>
                      <td className="px-3 py-2 font-mono text-xs">{m.idProducto}</td>
                      <td className="px-3 py-2 text-right">{m.cantidadAnterior}</td>
                      <td className="px-3 py-2 text-right font-medium">{m.cantidadNueva}</td>
                      <td className={`px-3 py-2 text-right font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </td>
                      <td className="px-3 py-2">{m.motivo}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">#{m.idUsuario}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-400 text-center">
        Contrato: registrarAjusteStock(idProducto, nuevaCantidad, motivo, idUsuario) — UC-07
      </div>
    </div>
  );
}
