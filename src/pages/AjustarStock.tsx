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
    <div className="h-full grid grid-cols-12 gap-5">
      {/* Panel izquierdo — Ajuste */}
      <section className="col-span-8 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList size={22} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">Ajustar Stock</h2>
          </div>
          <div className="text-base text-slate-400">
            Contrato: ajustarStock(idProducto, cantidad, tipo, motivo, idResponsable) — UC-04
          </div>
        </header>

        {ultimoAjuste && (
          <div className="mb-4 shrink-0 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={20} />
                <p className="text-base font-medium">
                  Ajuste registrado correctamente — <strong>{ultimoAjuste.producto.nombre} — {ultimoAjuste.producto.subcategoria}</strong>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base font-medium">
                  <Download size={16} /> PDF
                </button>
                <button onClick={imprimirComprobante} className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium">
                  <Printer size={16} /> Imprimir
                </button>
              </div>
            </div>
          </div>
        )}

        {!seleccionado && (
          <div className="flex flex-col min-h-0 flex-1">
            <label className="block text-base font-semibold text-slate-700 mb-2">Buscar producto</label>
            <div className="flex gap-2 mb-4 shrink-0">
              <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar por nombre, subcategoría o código..." className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base" />
              <button onClick={handleBuscar} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base shrink-0"><Search size={18} /> Buscar</button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {resultados.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  {resultados.map(p => (
                    <div key={p.codigo} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors" onClick={() => seleccionarProducto(p)}>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-base">{p.nombre} — {p.subcategoria}</p>
                        <p className="text-sm text-slate-500">Cód: {p.codigo} | Stock: {p.stockActual} | Mín: {p.stockMinimo}</p>
                      </div>
                      <p className="text-base text-blue-600 font-medium ml-3 shrink-0">${p.precioVenta.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ClipboardList size={44} className="mb-2 opacity-40" />
                  <p className="text-base text-center">Busque un producto para<br />ajustar su stock.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {seleccionado && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
            {/* Alerta de stock mínimo: card informativa con color dinámico */}
            <div className={`mb-4 p-4 rounded-lg border shrink-0 ${seleccionado.stockActual <= seleccionado.stockMinimo ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-base font-semibold text-slate-800 mb-1">Producto seleccionado: <strong>{seleccionado.nombre} — {seleccionado.subcategoria}</strong></p>
              <div className="flex gap-8 text-base mt-1.5">
                <span className="text-slate-500">Stock actual:
                  <strong className={`ml-1 tabular-nums ${seleccionado.stockActual <= seleccionado.stockMinimo ? 'text-red-600' : 'text-slate-800'}`}>{seleccionado.stockActual}</strong>
                </span>
                <span className="text-slate-500">Mínimo:
                  <strong className="ml-1 tabular-nums text-slate-800">{seleccionado.stockMinimo}</strong>
                </span>
                {seleccionado.stockActual <= seleccionado.stockMinimo && (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <AlertTriangle size={18} /> Por debajo del mínimo
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
              <FormField label="Tipo de ajuste" required>
                <div className="flex gap-6 mt-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" name="tipo" value="ingreso" checked={tipo === 'ingreso'} onChange={() => setTipo('ingreso')} className="accent-blue-600 w-4 h-4" />
                    <span className="text-base flex items-center gap-1.5"><Plus size={18} className="text-green-600" /> Ingreso</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" name="tipo" value="egreso" checked={tipo === 'egreso'} onChange={() => setTipo('egreso')} className="accent-blue-600 w-4 h-4" />
                    <span className="text-base flex items-center gap-1.5"><Minus size={18} className="text-red-600" /> Egreso</span>
                  </label>
                </div>
              </FormField>
              <FormField label="Cantidad" required error={errores.cantidad} htmlFor="cantidad">
                <TextInput id="cantidad" type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0" min="1" error={errores.cantidad} />
              </FormField>
            </div>

            <div className="mb-4 shrink-0">
              <FormField label="Motivo del ajuste" required error={errores.motivo} htmlFor="motivo">
                <textarea
                  id="motivo"
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Rotura de stock, error de inventario, devolución..."
                  rows={2}
                  className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base resize-none ${errores.motivo ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300'}`}
                />
              </FormField>
            </div>

            {stockError && (
              <div className="mb-4 shrink-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base flex items-center gap-2">
                <AlertTriangle size={18} /> {stockError}
              </div>
            )}

            <div className="flex gap-3 mt-auto shrink-0 pt-2">
              <button type="submit" className="flex items-center gap-1.5 px-7 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-base">
                <CheckCircle size={20} /> Aplicar Ajuste
              </button>
              <button type="button" onClick={nuevoAjuste} className="px-5 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-base">
                Cancelar
              </button>
              {ultimoAjuste && (
                <button type="button" onClick={nuevoAjuste} className="ml-auto text-base text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  + Realizar otro ajuste
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      {/* Panel derecho — Movimientos */}
      <section className="col-span-4 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <History size={22} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-slate-800">Movimientos registrados</h2>
          </div>
          <span className="text-sm text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{movimientosStockMock.length}</span>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left">
                <th className="py-2 pr-2">Fecha</th>
                <th className="py-2 pr-2">Producto</th>
                <th className="py-2 pr-2 text-right">Nuevo</th>
                <th className="py-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientosOrdenados.map((m: MovimientoStock) => {
                const prod = productoPorCodigo(m.idProducto);
                const esNuevo = ultimoAjuste?.id === m.id;
                return (
                  <tr key={m.id} className={`border-b border-slate-100 ${esNuevo ? 'bg-green-50 font-medium' : ''}`}>
                    <td className="py-2.5 pr-2 text-sm text-slate-500">{m.fecha.toLocaleDateString('es-AR')}</td>
                    <td className="py-2.5 pr-2">{prod?.nombre ?? m.idProducto}{esNuevo && <span className="ml-1 text-sm text-green-600">(nuevo)</span>}</td>
                    <td className="py-2.5 pr-2 text-right tabular-nums font-medium">{m.cantidadNueva}</td>
                    <td className="py-2.5 text-sm text-slate-500">{m.motivo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
