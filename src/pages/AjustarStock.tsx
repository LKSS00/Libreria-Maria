import { useState } from 'react';
import { productosMock, buscarProductos, movimientosStockMock } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, MovimientoStock } from '../types';
import { Search, ClipboardList, Plus, Minus, CheckCircle, History, Printer, Download, AlertTriangle } from 'lucide-react';
import { generarPDF, imprimirComprobante } from '../utils/pdfComprobante';
import { useToast } from '../components/Toast';
import { FormField, TextInput } from '../components/FormField';

export default function AjustarStock() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [stockError, setStockError] = useState('');
  const [verMovimientos, setVerMovimientos] = useState(false);
  const [ultimoAjuste, setUltimoAjuste] = useState<{
    id: number;
    producto: Producto;
    tipo: 'ingreso' | 'egreso';
    cantidad: number;
    motivo: string;
    cantidadAnterior: number;
    cantidadNueva: number;
  } | null>(null);

  const handleBuscar = () => {
    if (!busqueda.trim()) return;
    setResultados(buscarProductos(busqueda));
  };

  const seleccionarProducto = (p: Producto) => {
    setSeleccionado(p);
    setResultados([]);
    setBusqueda('');
    setStockError('');
  };

  const validarCampos = (): boolean => {
    const nuevos: Record<string, string> = {};
    if (!seleccionado) nuevos.producto = 'Seleccione un producto.';
    if (!cantidad || parseInt(cantidad) < 1) nuevos.cantidad = 'Ingrese una cantidad válida.';
    if (!motivo.trim()) nuevos.motivo = 'Indique el motivo del ajuste.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStockError('');

    if (!validarCampos()) {
      toastError('Complete los campos obligatorios marcados en rojo.');
      return;
    }

    if (!seleccionado) return;
    const cant = parseInt(cantidad);

    if (tipo === 'egreso' && cant > seleccionado.stockActual) {
      setStockError(`Stock insuficiente para realizar el ajuste. Disponible: ${seleccionado.stockActual}`);
      toastError(`Stock insuficiente para realizar el ajuste. Disponible: ${seleccionado.stockActual}`);
      return;
    }

    const p = productosMock.find(pr => pr.codigo === seleccionado.codigo);
    if (!p) return;
    const cantidadAnterior = p.stockActual;
    const diferencia = tipo === 'ingreso' ? cant : -cant;
    p.stockActual += diferencia;

    const nuevoMovimiento: MovimientoStock = {
      id: movimientosStockMock.length + 1,
      idProducto: p.codigo,
      cantidadAnterior,
      cantidadNueva: p.stockActual,
      motivo: motivo.trim(),
      idUsuario: user?.id ?? 0,
      fecha: new Date(),
    };
    movimientosStockMock.push(nuevoMovimiento);

    setUltimoAjuste({ id: nuevoMovimiento.id, producto: p, tipo, cantidad: cant, motivo: motivo.trim(), cantidadAnterior, cantidadNueva: p.stockActual });
    setVerMovimientos(true);
    setCantidad('');
    setMotivo('');
    setErrores({});
    setSeleccionado(null);
    toastSuccess('Ajuste registrado correctamente');
  };

  const nuevoAjuste = () => {
    setSeleccionado(null); setCantidad(''); setMotivo(''); setTipo('ingreso'); setErrores({}); setStockError(''); setUltimoAjuste(null);
  };

  const productoPorCodigo = (codigo: string) => productosMock.find(p => p.codigo === codigo);

  const handleDownloadPDF = () => {
    if (!ultimoAjuste) return;
    generarPDF({
      titulo: 'COMPROBANTE DE AJUSTE DE STOCK',
      numero: ultimoAjuste.id,
      cliente: user?.nombreReal ?? '—',
      items: [{
        producto: `${ultimoAjuste.producto.nombre} — ${ultimoAjuste.producto.subcategoria} (${ultimoAjuste.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'})`,
        cantidad: ultimoAjuste.cantidad,
        precioUnitario: 0,
        subtotal: 0,
      }],
      total: 0,
      fecha: new Date(),
      etiquetaCliente: 'Responsable',
    });
  };

  const movimientosOrdenados = [...movimientosStockMock].reverse();

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

        {ultimoAjuste && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={18} />
                <p className="text-sm font-medium">
                  Ajuste registrado correctamente — <strong>{ultimoAjuste.producto.nombre} — {ultimoAjuste.producto.subcategoria}</strong>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleDownloadPDF} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium">
                  <Download size={14} /> PDF
                </button>
                <button onClick={imprimirComprobante} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
                  <Printer size={14} /> Imprimir
                </button>
              </div>
            </div>
          </div>
        )}

        {verMovimientos && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Movimientos registrados ({movimientosStockMock.length})</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr><th className="text-left px-3 py-2">Fecha</th><th className="text-left px-3 py-2">Producto</th><th className="text-right px-3 py-2">Anterior</th><th className="text-right px-3 py-2">Nuevo</th><th className="text-left px-3 py-2">Motivo</th></tr>
                </thead>
                <tbody>
                  {movimientosOrdenados.map((m: MovimientoStock) => {
                    const prod = productoPorCodigo(m.idProducto);
                    const esNuevo = ultimoAjuste?.id === m.id;
                    return (
                      <tr key={m.id} className={`border-t border-slate-100 hover:bg-slate-50 ${esNuevo ? 'bg-green-50 font-medium' : ''}`}>
                        <td className="px-3 py-2 text-xs">{m.fecha.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-2">{prod?.nombre ?? m.idProducto}{esNuevo && <span className="ml-1 text-xs text-green-600">(nuevo)</span>}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{m.cantidadAnterior}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">{m.cantidadNueva}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{m.motivo}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!seleccionado && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar producto</label>
            <div className="flex gap-2 mb-4">
              <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar por nombre, subcategoría o código..." className="flex-1 max-w-md px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              <button onClick={handleBuscar} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"><Search size={16} /> Buscar</button>
            </div>
            {resultados.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {resultados.map(p => (
                  <div key={p.codigo} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => seleccionarProducto(p)}>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{p.nombre} — {p.subcategoria}</p>
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

        {seleccionado && (
          <form onSubmit={handleSubmit} noValidate>
            {/* Alerta de stock mínimo: card informativa con color dinámico */}
            <div className={`mb-4 p-4 rounded-lg border ${seleccionado.stockActual <= seleccionado.stockMinimo ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-sm font-medium text-slate-800 mb-1">Producto seleccionado: <strong>{seleccionado.nombre} — {seleccionado.subcategoria}</strong></p>
              <div className="flex gap-6 text-sm mt-1">
                <span className="text-slate-500">Stock actual:
                  <strong className={`ml-1 tabular-nums ${seleccionado.stockActual <= seleccionado.stockMinimo ? 'text-red-600' : 'text-slate-800'}`}>{seleccionado.stockActual}</strong>
                </span>
                <span className="text-slate-500">Mínimo:
                  <strong className="ml-1 tabular-nums text-slate-800">{seleccionado.stockMinimo}</strong>
                </span>
                {seleccionado.stockActual <= seleccionado.stockMinimo && (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <AlertTriangle size={14} /> Por debajo del mínimo
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Tipo de ajuste" required>
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
              </FormField>
              <FormField label="Cantidad" required error={errores.cantidad} htmlFor="cantidad">
                <TextInput id="cantidad" type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0" min="1" error={errores.cantidad} />
              </FormField>
            </div>

            <div className="mb-4">
              <FormField label="Motivo del ajuste" required error={errores.motivo} htmlFor="motivo">
                <textarea
                  id="motivo"
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Rotura de stock, error de inventario, devolución..."
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none ${errores.motivo ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300'}`}
                />
              </FormField>
            </div>

            {stockError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> {stockError}
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                <CheckCircle size={16} /> Aplicar Ajuste
              </button>
              <button type="button" onClick={nuevoAjuste} className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {ultimoAjuste && (
          <div className="mt-4 text-center">
            <button onClick={nuevoAjuste} className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              + Realizar otro ajuste
            </button>
          </div>
        )}
      </div>
      <div className="text-xs text-slate-400 text-center font-mono">Contrato: ajustarStock(idProducto, cantidad, tipo, motivo, idResponsable) — UC-10</div>
    </div>
  );
}
