import { useState, useMemo } from 'react';
import { productosMock, buscarProductos, pedidosMock } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, DetalleVenta } from '../types';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, History, MapPin, BookOpen, Package, Printer, Download } from 'lucide-react';
import { generarPDF, imprimirComprobante } from '../utils/pdfComprobante';

function displayName(p: Producto) {
  return `${p.nombre} — ${p.subcategoria}`;
}

export default function RealizarPedido() {
  const { user } = useAuth();
  const [modo, setModo] = useState<'buscar' | 'catalogo'>('catalogo');
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [items, setItems] = useState<DetalleVenta[]>([]);
  const [direccion, setDireccion] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState('');
  const [verHistorial, setVerHistorial] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  const categorias = useMemo(() => {
    const cats = new Set(productosMock.map(p => p.categoria));
    return ['Todas', ...Array.from(cats)];
  }, []);

  const familias = useMemo(() => {
    const filtered = categoriaFiltro === 'Todas' ? productosMock : productosMock.filter(p => p.categoria === categoriaFiltro);
    const map = new Map<string, Producto[]>();
    for (const p of filtered) {
      if (!map.has(p.nombre)) map.set(p.nombre, []);
      map.get(p.nombre)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [categoriaFiltro]);

  const handleBuscar = () => {
    if (!busqueda.trim()) return;
    setResultados(buscarProductos(busqueda));
  };

  const agregarItem = (p: Producto) => {
    setError('');
    const existente = items.find(i => i.producto.codigo === p.codigo);
    if (existente) {
      if (existente.cantidad + 1 > p.stockActual) { setError(`Stock insuficiente. Disponible: ${p.stockActual}`); return; }
      setItems(items.map(i => i.producto.codigo === p.codigo ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioCongelado } : i));
    } else {
      if (1 > p.stockActual) { setError(`Stock insuficiente para "${displayName(p)}".`); return; }
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

  const confirmarPedido = () => {
    setError('');
    if (items.length === 0) { setError('Agregue al menos un producto.'); return; }
    if (!direccion.trim()) { setError('Ingrese una dirección de entrega.'); return; }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (!p || p.stockActual < item.cantidad) { setError(`Stock insuficiente para "${displayName(item.producto)}".`); return; }
    }
    for (const item of items) { const p = productosMock.find(pr => pr.codigo === item.producto.codigo); if (p) p.stockActual -= item.cantidad; }
    setMostrarConfirmacion(true);
  };

  const nuevoPedido = () => { setItems([]); setDireccion(''); setMostrarConfirmacion(false); setError(''); setBusqueda(''); setResultados([]); };

  const cantidadEnCarrito = (codigo: string) => items.find(i => i.producto.codigo === codigo)?.cantidad ?? 0;

  if (mostrarConfirmacion) {
    const nroPedido = Math.floor(Math.random() * 9000) + 1000;

    const handleDownloadPDF = () => {
      generarPDF({
        titulo: 'COMPROBANTE DE PEDIDO',
        numero: nroPedido,
        cliente: user?.nombreReal ?? '—',
        direccion,
        items: items.map(i => ({
          producto: displayName(i.producto),
          cantidad: i.cantidad,
          precioUnitario: i.precioCongelado,
          subtotal: i.subtotal,
        })),
        total,
        fecha: new Date(),
        etiquetaCliente: 'Cliente',
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
            <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase">Comprobante de Pedido</h2>
          </div>
          <div className="text-sm space-y-1 mb-4 pb-3 border-b border-slate-300">
            <div className="flex justify-between">
              <span><strong>N° Pedido:</strong> {nroPedido}</span>
              <span><strong>Fecha:</strong> {new Date().toLocaleDateString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Cliente:</strong> {user?.nombreReal}</span>
              <span><strong>Hora:</strong> {new Date().toLocaleTimeString('es-AR')}</span>
            </div>
            <p><strong>Dirección de entrega:</strong> {direccion}</p>
            <p><strong>Estado:</strong> Pendiente</p>
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
                  <td className="py-2">{displayName(i.producto)}</td>
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
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2 justify-center no-print"><CheckCircle size={16} /> Pedido registrado.</div>
          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
              <Download size={16} /> Descargar PDF
            </button>
            <button onClick={imprimirComprobante} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={nuevoPedido} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
              Nuevo Pedido
            </button>
          </div>
          <div className="text-center text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200 no-print">
            <p>Contrato: realizarPedido(listaItems, idCliente, direccionEntrega) — UC-09</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><ShoppingCart size={20} className="text-blue-600" /><h2 className="text-lg font-semibold text-slate-800">Realizar Pedido</h2></div>
          <button onClick={() => setVerHistorial(!verHistorial)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <History size={16} /> {verHistorial ? 'Ocultar mis pedidos' : 'Mis pedidos'}
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}

        {verHistorial && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Pedidos anteriores</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr><th className="text-left px-3 py-2">N°</th><th className="text-left px-3 py-2">Fecha</th><th className="text-left px-3 py-2">Dirección</th><th className="text-right px-3 py-2">Total</th><th className="text-left px-3 py-2">Estado</th></tr>
                </thead>
                <tbody>{pedidosMock.map(p => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono">{p.id}</td>
                    <td className="px-3 py-2 text-xs">{p.fecha.toLocaleString('es-AR')}</td>
                    <td className="px-3 py-2 text-xs">{p.direccionEntrega}</td>
                    <td className="px-3 py-2 text-right font-medium">${p.total.toFixed(2)}</td>
                    <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${p.estado === 'Entregado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.estado}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabs: Buscar / Catálogo */}
        <div className="flex gap-1 mb-4 border-b border-slate-200">
          <button onClick={() => setModo('catalogo')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${modo === 'catalogo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <BookOpen size={16} /> Catálogo
          </button>
          <button onClick={() => setModo('buscar')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${modo === 'buscar' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Search size={16} /> Buscar
          </button>
        </div>

        {/* Search mode */}
        {modo === 'buscar' && (
          <>
            <div className="flex gap-2 mb-4">
              <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar producto por nombre, subcategoría o código..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              <button onClick={handleBuscar} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"><Search size={16} /> Buscar</button>
            </div>

            {resultados.length > 0 && (
              <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {resultados.map(p => (
                  <div key={p.codigo} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => agregarItem(p)}>
                    <div><p className="font-medium text-slate-800 text-sm">{displayName(p)}</p><p className="text-xs text-slate-500">Stock: {p.stockActual} | Cód: {p.codigo}</p></div>
                    <div className="text-right"><p className="font-semibold text-blue-600">${p.precioVenta.toFixed(2)}</p><p className="text-xs text-green-600 flex items-center gap-0.5"><Plus size={12} /> agregar</p></div>
                  </div>
                ))}
              </div>
            )}

            {!resultados.length && <p className="text-sm text-slate-400 text-center py-4">Busque productos por nombre, subcategoría o código.</p>}
          </>
        )}

        {/* Catalog mode — grouped by family */}
        {modo === 'catalogo' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {categorias.map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${categoriaFiltro === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {familias.map(([familia, variantes]) => (
                <div key={familia} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Package size={16} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">{familia}</h3>
                  </div>
                  <div className="space-y-2">
                    {variantes.map(p => {
                      const enCarrito = cantidadEnCarrito(p.codigo);
                      const sinStock = p.stockActual <= 0;
                      return (
                        <div key={p.codigo} className={`flex items-center justify-between rounded-lg px-3 py-2 ${sinStock ? 'opacity-50' : 'bg-slate-50 hover:bg-blue-50 transition-colors'}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{p.subcategoria}</p>
                            <p className="text-xs text-slate-400">Stock: {p.stockActual} uds.</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-sm font-bold text-blue-600 tabular-nums">${p.precioVenta.toFixed(2)}</span>
                            {sinStock ? (
                              <span className="text-xs text-red-500 font-medium whitespace-nowrap">Sin stock</span>
                            ) : (
                              <button onClick={() => agregarItem(p)}
                                className="flex items-center gap-0.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium whitespace-nowrap">
                                <Plus size={12} /> {enCarrito > 0 ? `+${enCarrito}` : 'Agregar'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {variantes.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Sin variantes disponibles</p>}
                </div>
              ))}
            </div>

            {familias.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No hay productos en esta categoría.</p>
            )}
          </div>
        )}

        {/* Carrito */}
        {items.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-700">Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})</h3>
            </div>
            <table className="w-full text-sm mb-3">
              <thead><tr className="border-b border-slate-200"><th className="text-left py-2">Producto</th><th className="text-center py-2">Cantidad</th><th className="text-right py-2">P. Unit.</th><th className="text-right py-2">Subtotal</th><th className="w-10"></th></tr></thead>
              <tbody>{items.map(i => (
                <tr key={i.producto.codigo} className="border-b border-slate-100">
                  <td className="py-2 text-sm">{displayName(i.producto)}</td>
                  <td className="text-center py-2">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad - 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Minus size={14} /></button>
                      <span className="w-8 text-center font-medium text-sm tabular-nums">{i.cantidad}</span>
                      <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad + 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Plus size={14} /></button>
                    </div>
                  </td>
                  <td className="text-right py-2 text-sm tabular-nums">${i.precioCongelado.toFixed(2)}</td>
                  <td className="text-right py-2 text-sm tabular-nums font-medium">${i.subtotal.toFixed(2)}</td>
                  <td className="text-center py-2"><button onClick={() => setItems(items.filter(x => x.producto.codigo !== i.producto.codigo))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button></td>
                </tr>
              ))}</tbody>
            </table>
            <div className="text-right text-xl font-bold text-slate-800 tabular-nums mb-4">Total: ${total.toFixed(2)}</div>

            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"><MapPin size={14} /> Dirección de entrega <span className="text-red-500">*</span></label>
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Calle, número, ciudad..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <button onClick={confirmarPedido} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-base flex items-center justify-center gap-2">
                <ShoppingCart size={18} /> Confirmar Pedido — ${total.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && modo === 'buscar' && !resultados.length && (
          <p className="text-sm text-slate-400 text-center py-4">Busque productos para armar su pedido.</p>
        )}
      </div>
      <div className="text-xs text-slate-400 text-center font-mono">Contrato: realizarPedido(listaItems, idCliente, direccionEntrega) — UC-09</div>
    </div>
  );
}
