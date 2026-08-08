import { useState } from 'react';
import { proveedoresMock, productosMock } from '../data/mockData';
import type { Proveedor, Producto } from '../types';
import { Package, Search, Save, X, CheckCircle2, Eye } from 'lucide-react';
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
    <div className="h-full grid grid-cols-12 gap-5">
      {/* Panel izquierdo — Formulario */}
      <section className="col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Package size={22} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">Registrar Nuevo Producto</h2>
          </div>
          <div className="text-sm text-slate-400 text-right">
            Contrato: registrarProducto(codigo, nombre, subcategoria,<br />categoria, precioCosto, precioVenta, stockActual, stockMinimo, idProveedor) — UC-03
          </div>
        </header>

        <div className="mb-5 p-4 bg-slate-50 rounded-lg border border-slate-200 shrink-0">
          <FormField label="Verificar Proveedor" required error={proveedorError} htmlFor="proveedorId">
            <div className="flex gap-2">
              <TextInput
                id="proveedorId"
                type="number"
                value={proveedorId}
                onChange={e => { setProveedorId(e.target.value); setProveedorError(''); }}
                placeholder="ID del proveedor"
                className="flex-1"
                error={proveedorError || undefined}
              />
              <button type="button" onClick={verificarProveedor} className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base shrink-0">
                <Search size={18} /> Verificar
              </button>
            </div>
          </FormField>
          {proveedorValido && (
            <div className="mt-2.5 text-base text-green-700 bg-green-50 px-3.5 py-2.5 rounded flex items-center gap-2">
              <CheckCircle2 size={18} /> Proveedor válido: <strong>{proveedorValido.nombreEmpresa}</strong>
            </div>
          )}
          <div className="mt-2.5 text-sm text-slate-400">IDs: 1=Distribuidora Norte, 2=Faber-Castell, 3=Papelera del Valle, 4=Maxim Oficinas</div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 min-h-0 overflow-y-auto">
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

          <div className="flex gap-3 pt-5 mt-4 border-t border-slate-200 shrink-0">
            <button type="submit" disabled={!proveedorValido} className="flex items-center gap-1.5 px-7 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-base">
              <Save size={20} /> Guardar Producto
            </button>
            <button type="button" onClick={cancelar} className="flex items-center gap-1.5 px-7 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-base">
              <X size={20} /> Cancelar
            </button>
          </div>
        </form>
      </section>

      {/* Panel derecho — Catálogo */}
      <section className="col-span-7 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={22} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-slate-800">Catálogo de productos</h2>
          </div>
          <span className="text-sm text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{productosMock.length} productos</span>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-base">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b-2 border-slate-200 text-left">
                <th className="py-2 pr-2">Código</th>
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2">Subcategoría</th>
                <th className="py-2 pr-2">P. Venta</th>
                <th className="py-2 pr-2 text-right">Stock</th>
                <th className="py-2">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {productosMock.map(p => (
                <tr key={p.codigo} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-1.5 pr-2 font-mono text-sm">{p.codigo}</td>
                  <td className="py-1.5 pr-2 font-medium">{p.nombre}</td>
                  <td className="py-1.5 pr-2 text-sm text-slate-600">{p.subcategoria}</td>
                  <td className="py-1.5 pr-2 tabular-nums">${p.precioVenta.toFixed(2)}</td>
                  <td className={`py-1.5 pr-2 text-right tabular-nums ${p.stockActual <= p.stockMinimo ? 'text-red-600 font-semibold' : ''}`}>{p.stockActual}</td>
                  <td className="py-1.5 text-sm text-slate-500">{proveedorNombre(p.idProveedor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
