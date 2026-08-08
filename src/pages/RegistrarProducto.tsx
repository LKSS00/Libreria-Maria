import { useState } from 'react';
import { proveedoresMock, productosMock } from '../data/mockData';
import type { Proveedor, Producto } from '../types';
import { Package, Search, Save, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast';
import { FormField, TextInput, SelectInput } from '../components/FormField';

export function registrarProducto(
  codigo: string,
  nombre: string,
  subcategoria: string,
  categoria: string,
  precioCosto: number,
  precioVenta: number,
  stockActual: number,
  stockMinimo: number,
  idProveedor: number
): Producto {
  const producto: Producto = {
    codigo, nombre, subcategoria, categoria,
    precioCosto, precioVenta, stockActual, stockMinimo,
    idProveedor,
  };
  productosMock.push(producto);
  return producto;
}

export default function RegistrarProducto() {
  const { success, error } = useToast();
  const [proveedorId, setProveedorId] = useState('');
  const [proveedorValido, setProveedorValido] = useState<Proveedor | null>(null);
  const [verProductos, setVerProductos] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [categoria, setCategoria] = useState('Escolar');
  const [precioCosto, setPrecioCosto] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [stockActual, setStockActual] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [proveedorError, setProveedorError] = useState('');

  const verificarProveedor = () => {
    setProveedorError('');
    const id = parseInt(proveedorId);
    if (isNaN(id)) {
      setProveedorValido(null);
      setProveedorError('Ingrese un ID de proveedor válido.');
      error('Ingrese un ID de proveedor válido.');
      return;
    }
    const prov = proveedoresMock.find(p => p.id === id);
    if (prov) {
      setProveedorValido(prov);
      success(`Proveedor verificado: ${prov.nombreEmpresa}.`);
    } else {
      setProveedorValido(null);
      setProveedorError('Proveedor no encontrado. Verifique el ID.');
      error('Proveedor no encontrado. Verifique el ID.');
    }
  };

  const validarCampos = (): boolean => {
    const nuevos: Record<string, string> = {};
    if (!codigo.trim()) nuevos.codigo = 'El código es obligatorio.';
    if (!nombre.trim()) nuevos.nombre = 'El nombre es obligatorio.';
    if (!subcategoria.trim()) nuevos.subcategoria = 'La subcategoría es obligatoria.';
    if (!precioCosto) nuevos.precioCosto = 'El precio de costo es obligatorio.';
    if (!precioVenta) nuevos.precioVenta = 'El precio de venta es obligatorio.';
    if (!stockActual) nuevos.stockActual = 'El stock actual es obligatorio.';
    if (!stockMinimo) nuevos.stockMinimo = 'El stock mínimo es obligatorio.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedorValido) {
      setProveedorError('Debe verificar un proveedor primero. Los campos permanecen deshabilitados.');
      error('Debe verificar un proveedor válido para registrar el producto.');
      return;
    }
    if (!validarCampos()) {
      error('Complete los campos obligatorios marcados en rojo.');
      return;
    }

    const pc = parseFloat(precioCosto), pv = parseFloat(precioVenta);
    const sa = parseInt(stockActual), sm = parseInt(stockMinimo);

    if (productosMock.find(p => p.codigo === codigo)) {
      setErrores(prev => ({ ...prev, codigo: 'El código de producto ya existe.' }));
      error('El código de producto ya existe.');
      return;
    }
    if (pc <= 0 || pv <= 0) {
      setErrores(prev => ({
        ...prev,
        ...(pc <= 0 ? { precioCosto: 'Debe ser mayor a 0.' } : {}),
        ...(pv <= 0 ? { precioVenta: 'Debe ser mayor a 0.' } : {}),
      }));
      error('Verifique los valores numéricos.');
      return;
    }
    if (sa < 0 || sm < 0) {
      setErrores(prev => ({
        ...prev,
        ...(sa < 0 ? { stockActual: 'No puede ser negativo.' } : {}),
        ...(sm < 0 ? { stockMinimo: 'No puede ser negativo.' } : {}),
      }));
      error('Verifique los valores numéricos.');
      return;
    }

    registrarProducto(codigo, nombre.trim(), subcategoria.trim(), categoria, pc, pv, sa, sm, proveedorValido.id);
    success('Producto registrado con éxito');

    setCodigo(''); setNombre(''); setSubcategoria(''); setCategoria('Escolar');
    setPrecioCosto(''); setPrecioVenta(''); setStockActual(''); setStockMinimo('');
    setErrores({});
  };

  const cancelar = () => {
    setCodigo(''); setNombre(''); setSubcategoria(''); setCategoria('Escolar');
    setPrecioCosto(''); setPrecioVenta(''); setStockActual(''); setStockMinimo('');
    setProveedorId(''); setProveedorValido(null); setProveedorError(''); setErrores({});
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
          <FormField label="Verificar Proveedor" required error={proveedorError} htmlFor="proveedorId">
            <div className="flex gap-2">
              <TextInput
                id="proveedorId"
                type="number"
                value={proveedorId}
                onChange={e => { setProveedorId(e.target.value); setProveedorError(''); }}
                placeholder="ID del proveedor"
                className="flex-1 max-w-xs"
                error={proveedorError || undefined}
              />
              <button type="button" onClick={verificarProveedor} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Search size={16} /> Verificar
              </button>
            </div>
          </FormField>
          {proveedorValido && (
            <div className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded flex items-center gap-1.5">
              <Search size={14} /> Proveedor válido: <strong>{proveedorValido.nombreEmpresa}</strong>
            </div>
          )}
          <div className="mt-2 text-xs text-slate-400">IDs: 1=Distribuidora Norte, 2=Faber-Castell, 3=Papelera del Valle, 4=Maxim Oficinas</div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Código" required error={errores.codigo} htmlFor="codigo">
              <TextInput id="codigo" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código de barras" disabled={!proveedorValido} error={errores.codigo} />
            </FormField>
            <FormField label="Nombre" required error={errores.nombre} htmlFor="nombre">
              <TextInput id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Pegamento Voligoma" disabled={!proveedorValido} error={errores.nombre} />
            </FormField>
            <FormField label="Subcategoría" required error={errores.subcategoria} htmlFor="subcategoria">
              <TextInput id="subcategoria" value={subcategoria} onChange={e => setSubcategoria(e.target.value)} placeholder="Ej: 50ml, azul, 48 hojas" disabled={!proveedorValido} error={errores.subcategoria} />
            </FormField>
            <FormField label="Categoría" required htmlFor="categoria">
              <SelectInput id="categoria" value={categoria} onChange={e => setCategoria(e.target.value)} disabled={!proveedorValido}>
                <option>Escolar</option><option>Oficina</option><option>Artística</option>
              </SelectInput>
            </FormField>
            <FormField label="Precio Costo" required error={errores.precioCosto} htmlFor="precioCosto">
              <TextInput id="precioCosto" type="number" value={precioCosto} onChange={e => setPrecioCosto(e.target.value)} placeholder="0.00" min="0" step="0.01" disabled={!proveedorValido} error={errores.precioCosto} />
            </FormField>
            <FormField label="Precio Venta" required error={errores.precioVenta} htmlFor="precioVenta">
              <TextInput id="precioVenta" type="number" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} placeholder="0.00" min="0" step="0.01" disabled={!proveedorValido} error={errores.precioVenta} />
            </FormField>
            <FormField label="Stock Actual" required error={errores.stockActual} htmlFor="stockActual">
              <TextInput id="stockActual" type="number" value={stockActual} onChange={e => setStockActual(e.target.value)} placeholder="0" min="0" disabled={!proveedorValido} error={errores.stockActual} />
            </FormField>
            <FormField label="Stock Mínimo" required error={errores.stockMinimo} htmlFor="stockMinimo">
              <TextInput id="stockMinimo" type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} placeholder="0" min="0" disabled={!proveedorValido} error={errores.stockMinimo} />
            </FormField>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={!proveedorValido} className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-sm">
              <Save size={16} /> Guardar Producto
            </button>
            <button type="button" onClick={cancelar} className="flex items-center gap-1.5 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
              <X size={16} /> Cancelar
            </button>
          </div>
        </form>
      </div>
      <div className="text-xs text-slate-400 text-center font-mono">Contrato: registrarProducto(codigo, nombre, subcategoria, categoria, precioCosto, precioVenta, stockActual, stockMinimo, idProveedor) — UC-03</div>
    </div>
  );
}
