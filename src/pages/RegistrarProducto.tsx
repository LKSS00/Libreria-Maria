import { useState } from 'react';
import { proveedoresMock, productosMock } from '../data/mockData';
import type { Proveedor } from '../types';
import { Package, Search, Save, X, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegistrarProducto() {
  const [proveedorId, setProveedorId] = useState('');
  const [proveedorValido, setProveedorValido] = useState<Proveedor | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verProductos, setVerProductos] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [categoria, setCategoria] = useState('Escolar');
  const [precioCosto, setPrecioCosto] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [stockActual, setStockActual] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');

  const verificarProveedor = () => {
    setError(''); setSuccess('');
    const id = parseInt(proveedorId);
    if (isNaN(id)) { setError('Ingrese un ID de proveedor válido.'); setProveedorValido(null); return; }
    const prov = proveedoresMock.find(p => p.id === id);
    if (prov) { setProveedorValido(prov); setError(''); }
    else { setError('Proveedor no encontrado. Verifique el ID.'); setProveedorValido(null); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!proveedorValido) { setError('Debe verificar un proveedor primero.'); return; }
    if (!codigo || !nombre || !subcategoria || !precioCosto || !precioVenta || !stockActual || !stockMinimo) { setError('Complete todos los campos obligatorios.'); return; }
    if (productosMock.find(p => p.codigo === codigo)) { setError('El código de producto ya existe.'); return; }
    const pc = parseFloat(precioCosto), pv = parseFloat(precioVenta), sa = parseInt(stockActual), sm = parseInt(stockMinimo);
    if (pc <= 0 || pv <= 0 || sa < 0 || sm < 0) { setError('Verifique los valores numéricos.'); return; }
    productosMock.push({ codigo, nombre, subcategoria, categoria, precioCosto: pc, precioVenta: pv, stockActual: sa, stockMinimo: sm, idProveedor: proveedorValido.id });
    setSuccess(`Producto "${nombre} - ${subcategoria}" registrado con éxito.`);
    setCodigo(''); setNombre(''); setSubcategoria(''); setCategoria('Escolar'); setPrecioCosto(''); setPrecioVenta(''); setStockActual(''); setStockMinimo(''); setProveedorId(''); setProveedorValido(null);
  };

  const proveedorNombre = (id: number) => proveedoresMock.find(p => p.id === id)?.nombreEmpresa ?? '—';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Registrar Nuevo Producto</h2>
          </div>
          <button onClick={() => setVerProductos(!verProductos)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            {verProductos ? <EyeOff size={16} /> : <Eye size={16} />}
            {verProductos ? 'Ocultar catálogo' : 'Ver catálogo'}
          </button>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {verProductos && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Productos existentes ({productosMock.length})</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr><th className="text-left px-3 py-2">Código</th><th className="text-left px-3 py-2">Nombre</th><th className="text-left px-3 py-2">Subcategoría</th><th className="text-left px-3 py-2">Cat.</th><th className="text-right px-3 py-2">P. Venta</th><th className="text-right px-3 py-2">Stock</th><th className="text-left px-3 py-2">Proveedor</th></tr>
                </thead>
                <tbody>
                  {productosMock.map(p => (
                    <tr key={p.codigo} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-xs">{p.codigo}</td>
                      <td className="px-3 py-2">{p.nombre}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{p.subcategoria}</td>
                      <td className="px-3 py-2">{p.categoria}</td>
                      <td className="px-3 py-2 text-right">${p.precioVenta.toFixed(2)}</td>
                      <td className={`px-3 py-2 text-right ${p.stockActual <= p.stockMinimo ? 'text-red-600 font-medium' : ''}`}>{p.stockActual}</td>
                      <td className="px-3 py-2">{proveedorNombre(p.idProveedor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">Verificar Proveedor <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input type="number" value={proveedorId} onChange={e => setProveedorId(e.target.value)} placeholder="ID del proveedor" className="flex-1 max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="button" onClick={verificarProveedor} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Search size={16} /> Verificar
            </button>
          </div>
          {proveedorValido && <div className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded flex items-center gap-1.5"><CheckCircle size={14} /> Proveedor válido: <strong>{proveedorValido.nombreEmpresa}</strong></div>}
          <div className="mt-2 text-xs text-slate-400">IDs: 1=Distribuidora Norte, 2=Faber-Castell, 3=Papelera del Valle, 4=Maxim Oficinas</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código de barras" disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Pegamento Voligoma" disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subcategoría <span className="text-red-500">*</span></label>
              <input type="text" value={subcategoria} onChange={e => setSubcategoria(e.target.value)} placeholder="Ej: 50ml, azul, 48 hojas" disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría <span className="text-red-500">*</span></label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100">
                <option>Escolar</option><option>Oficina</option><option>Artística</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Costo <span className="text-red-500">*</span></label>
              <input type="number" value={precioCosto} onChange={e => setPrecioCosto(e.target.value)} placeholder="0.00" min="0" step="0.01" disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta <span className="text-red-500">*</span></label>
              <input type="number" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} placeholder="0.00" min="0" step="0.01" disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual <span className="text-red-500">*</span></label>
              <input type="number" value={stockActual} onChange={e => setStockActual(e.target.value)} placeholder="0" min="0" disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo <span className="text-red-500">*</span></label>
              <input type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} placeholder="0" min="0" disabled={!proveedorValido} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
          </div>
          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={!proveedorValido} className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-sm">
              <Save size={16} /> Guardar Producto
            </button>
            <button type="button" onClick={() => { setCodigo(''); setNombre(''); setSubcategoria(''); setCategoria('Escolar'); setPrecioCosto(''); setPrecioVenta(''); setStockActual(''); setStockMinimo(''); setProveedorId(''); setProveedorValido(null); setError(''); setSuccess(''); }}
              className="flex items-center gap-1.5 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
              <X size={16} /> Cancelar
            </button>
          </div>
        </form>
      </div>
      <div className="text-xs text-slate-400 text-center font-mono">Contrato: registrarProducto(datosProducto) — UC-03</div>
    </div>
  );
}
