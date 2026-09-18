import { useState, useMemo } from 'react';
import { productosMock, buscarProductos, pedidosMock, stockDisponible } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, ItemCarrito, Pedido } from '../types';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, History, BookOpen, Package, Printer, Download, User, Phone, IdCard } from 'lucide-react';
import { generarPDF, imprimirComprobante } from '../utils/pdfComprobante';
import { useToast } from '../components/Toast';

function displayName(p: Producto) {
  return `${p.nombre} — ${p.subcategoria}`;
}

export function realizarPedido(
  nombreCliente: string,
  contacto: string,
  dni: string,
  listaItems: ItemCarrito[]
): Pedido {
  const total = listaItems.reduce((sum, i) => sum + i.subtotal, 0);
  const id = Math.max(0, ...pedidosMock.map(p => p.id)) + 1;
  for (const item of listaItems) {
    const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
    if (p) p.stockReservado += item.cantidad;
  }
  const pedido: Pedido = {
    id,
    cliente: { nombre: nombreCliente.trim(), contacto: contacto.trim(), dni: dni.trim() },
    items: listaItems,
    total,
    descuento: 0,
    fecha: new Date(),
    estado: 'Pendiente',
  };
  pedidosMock.push(pedido);
  return pedido;
}

export default function RealizarPedido() {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [modo, setModo] = useState<'buscar' | 'catalogo'>('catalogo');
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [nombreCliente, setNombreCliente] = useState(user?.nombreReal ?? '');
  const [contacto, setContacto] = useState('');
  const [dni, setDni] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState('');
  const [verHistorial, setVerHistorial] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  const mostrarError = (msg: string) => {
    setError(msg);
    toastError(msg);
  };

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
    const disponible = stockDisponible(p);
    const existente = items.find(i => i.producto.codigo === p.codigo);
    if (existente) {
      if (existente.cantidad + 1 > disponible) { mostrarError(`Stock disponible insuficiente. Disponible: ${disponible}`); return; }
      setItems(items.map(i => i.producto.codigo === p.codigo ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioCongelado } : i));
    } else {
      if (1 > disponible) { mostrarError(`Stock disponible insuficiente para "${displayName(p)}".`); return; }
      setItems([...items, { producto: p, cantidad: 1, precioCongelado: p.precioVenta, subtotal: p.precioVenta }]);
    }
    setBusqueda(''); setResultados([]);
  };

  const cambiarCantidad = (codigo: string, nuevaCant: number) => {
    setError('');
    if (nuevaCant < 1) { setItems(items.filter(i => i.producto.codigo !== codigo)); return; }
    const p = items.find(i => i.producto.codigo === codigo);
    if (p && nuevaCant > stockDisponible(p.producto)) { mostrarError(`Stock disponible insuficiente. Máximo: ${stockDisponible(p.producto)}`); return; }
    setItems(items.map(i => i.producto.codigo === codigo ? { ...i, cantidad: nuevaCant, subtotal: nuevaCant * i.precioCongelado } : i));
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const confirmarPedido = () => {
    setError('');
    if (items.length === 0) { mostrarError('Agregue al menos un producto.'); return; }
    if (!nombreCliente.trim()) { mostrarError('Ingrese el nombre del cliente.'); return; }
    if (!contacto.trim()) { mostrarError('Ingrese un medio de contacto (teléfono o email).'); return; }
    if (!dni.trim()) { mostrarError('Ingrese el DNI del cliente.'); return; }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (!p || stockDisponible(p) < item.cantidad) { mostrarError(`Stock disponible insuficiente para "${displayName(item.producto)}".`); return; }
    }
    realizarPedido(nombreCliente, contacto, dni, items);
    setMostrarConfirmacion(true);
  };

  const nuevoPedido = () => { setItems([]); setNombreCliente(user?.nombreReal ?? ''); setContacto(''); setDni(''); setMostrarConfirmacion(false); setError(''); setBusqueda(''); setResultados([]); };

  const cantidadEnCarrito = (codigo: string) => items.find(i => i.producto.codigo === codigo)?.cantidad ?? 0;

  if (mostrarConfirmacion) {
    const nroPedido = Math.floor(Math.random() * 9000) + 1000;

    const handleDownloadPDF = () => {
      generarPDF({
        titulo: 'COMPROBANTE DE PEDIDO',
        numero: nroPedido,
        cliente: `${nombreCliente} — DNI ${dni} — ${contacto}`,
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
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div id="comprobante-print" className="bg-white rounded-xl border border-slate-200 p-7">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Times New Roman', serif" }}>Librería María</div>
              <p className="text-sm text-slate-500 mt-1">Av. 9 de Julio 1200 — Apóstoles, Misiones</p>
              <p className="text-sm text-slate-500">Tel: xxx | xxx@gmail.com</p>
              <hr className="my-3 border-t-2 border-slate-800" />
              <h2 className="text-xl font-bold text-slate-800 tracking-wide uppercase">Comprobante de Pedido</h2>
            </div>
            <div className="text-base space-y-1 mb-4 pb-3 border-b border-slate-300">
              <div className="flex justify-between">
                <span><strong>N° Pedido:</strong> {nroPedido}</span>
                <span><strong>Fecha:</strong> {new Date().toLocaleDateString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Cliente:</strong> {nombreCliente}</span>
                <span><strong>Hora:</strong> {new Date().toLocaleTimeString('es-AR')}</span>
              </div>
              <p><strong>Contacto:</strong> {contacto}</p>
              <p><strong>DNI:</strong> {dni}</p>
              <p><strong>Estado:</strong> Pendiente</p>
            </div>
            <table className="w-full text-base mb-4">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="text-left py-2 text-sm uppercase tracking-wide">Producto</th>
                  <th className="text-center py-2 text-sm uppercase tracking-wide">Cant.</th>
                  <th className="text-right py-2 text-sm uppercase tracking-wide">P. Unit.</th>
                  <th className="text-right py-2 text-sm uppercase tracking-wide">Subtotal</th>
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
              <span className="text-base text-slate-600">Total {items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
              <span className="text-3xl font-bold text-slate-800">${total.toFixed(2)}</span>
            </div>
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-base mb-4 flex items-center gap-2 justify-center no-print"><CheckCircle size={18} /> Pedido registrado. Stock reservado temporalmente hasta la confirmación.</div>
            <div className="flex flex-col sm:flex-row gap-3 no-print">
              <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-base">
                <Download size={18} /> Descargar PDF
              </button>
              <button onClick={imprimirComprobante} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-base">
                <Printer size={18} /> Imprimir
              </button>
              <button onClick={nuevoPedido} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-base">
                Nuevo Pedido
              </button>
            </div>
            <div className="text-center text-sm text-slate-400 mt-4 pt-3 border-t border-slate-200 no-print">
              <p>Contrato: realizarPedido(nombreCliente, contacto, dni, listaItems) — UC-08</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-12 gap-5">
      {/* Panel izquierdo — Catálogo / Buscar */}
      <section className="col-span-8 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">Realizar Pedido</h2>
          </div>
          <button onClick={() => setVerHistorial(!verHistorial)} className="flex items-center gap-1.5 text-base text-blue-600 hover:text-blue-800 transition-colors">
            <History size={18} /> {verHistorial ? 'Ocultar mis pedidos' : 'Mis pedidos'}
          </button>
        </header>

        {error && <div className="mb-3 shrink-0 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-base">{error}</div>}

        {verHistorial && (
          <div className="mb-4 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-700">Pedidos anteriores</h3>
              <button onClick={() => setVerHistorial(false)} className="text-sm text-slate-400 hover:text-slate-600">cerrar</button>
            </div>
            <table className="w-full text-base border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-3 py-2">N°</th><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Cliente</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>{pedidosMock.map(p => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{p.id}</td>
                  <td className="px-3 py-2 text-sm text-slate-500">{p.fecha.toLocaleDateString('es-AR')}</td>
                  <td className="px-3 py-2 text-sm">{p.cliente.nombre}</td>
                  <td className="px-3 py-2 text-right font-medium">${p.total.toFixed(2)}</td>
                  <td className="px-3 py-2"><span className={`text-sm px-2.5 py-0.5 rounded-full ${p.estado === 'Confirmado' || p.estado === 'Entregado' ? 'bg-green-100 text-green-700' : p.estado === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.estado}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Tabs: Catálogo / Buscar */}
        <div className="flex gap-1 mb-4 border-b border-slate-200 shrink-0">
          <button onClick={() => setModo('catalogo')}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-base font-semibold border-b-2 transition-colors ${modo === 'catalogo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <BookOpen size={18} /> Catálogo
          </button>
          <button onClick={() => setModo('buscar')}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-base font-semibold border-b-2 transition-colors ${modo === 'buscar' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Search size={18} /> Buscar
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Search mode */}
          {modo === 'buscar' && (
            <div>
              <div className="flex gap-2 mb-4 sticky top-0 bg-white pt-1 pb-2">
                <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar producto por nombre, subcategoría o código..." className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                <button onClick={handleBuscar} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base"><Search size={18} /> Buscar</button>
              </div>

              {resultados.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  {resultados.map(p => (
                    <div key={p.codigo} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors" onClick={() => agregarItem(p)}>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-base truncate">{displayName(p)}</p>
                        <p className="text-sm text-slate-500">Stock disponible: {stockDisponible(p)} | Cód: {p.codigo}</p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="font-semibold text-blue-600 text-base">${p.precioVenta.toFixed(2)}</p>
                        <p className="text-sm text-green-600 flex items-center gap-0.5 justify-end"><Plus size={14} /> agregar</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!resultados.length && (
                <p className="text-base text-slate-400 text-center py-10">Busque productos por nombre, subcategoría o código.</p>
              )}
            </div>
          )}

          {/* Catalog mode — grouped by family */}
          {modo === 'catalogo' && (
            <div>
              <div className="flex flex-wrap gap-2 mb-4 sticky top-0 bg-white pt-1 pb-2">
                {categorias.map(cat => (
                  <button key={cat} onClick={() => setCategoriaFiltro(cat)}
                    className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${categoriaFiltro === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {familias.map(([familia, variantes]) => (
                  <div key={familia} className="border border-slate-200 rounded-xl p-3.5 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Package size={18} />
                      </div>
                      <h3 className="font-semibold text-slate-800 text-base truncate">{familia}</h3>
                    </div>
                    <div className="space-y-2">
                      {variantes.map(p => {
                        const enCarrito = cantidadEnCarrito(p.codigo);
                        const sinStock = stockDisponible(p) <= 0;
                        return (
                          <div key={p.codigo} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${sinStock ? 'opacity-50' : 'bg-slate-50 hover:bg-blue-50 transition-colors'}`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-medium text-slate-700 truncate">{p.subcategoria}</p>
                              <p className="text-sm text-slate-400">Stock disponible: {stockDisponible(p)} uds.</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span className="text-base font-bold text-blue-600 tabular-nums">${p.precioVenta.toFixed(2)}</span>
                              {sinStock ? (
                                <span className="text-sm text-red-500 font-medium whitespace-nowrap">Sin stock</span>
                              ) : (
                                <button onClick={() => agregarItem(p)}
                                  className="flex items-center gap-0.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap">
                                  <Plus size={14} /> {enCarrito > 0 ? `+${enCarrito}` : 'Agregar'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {variantes.length === 0 && <p className="text-sm text-slate-400 text-center py-2">Sin variantes disponibles</p>}
                  </div>
                ))}
              </div>

              {familias.length === 0 && (
                <p className="text-base text-slate-400 text-center py-10">No hay productos en esta categoría.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Panel derecho — Carrito */}
      <section className="col-span-4 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">Carrito</h2>
          </div>
          {items.length > 0 && <span className="text-sm text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{items.length} {items.length === 1 ? 'item' : 'items'}</span>}
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart size={44} className="mb-2 opacity-40" />
            <p className="text-base text-center">El carrito está vacío.<br />Agregue productos del catálogo.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-left">
                    <th className="py-2 pr-2">Producto</th>
                    <th className="py-2 pr-2 text-center">Cant.</th>
                    <th className="py-2 pr-2 text-right">Subtotal</th>
                    <th className="py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.producto.codigo} className="border-b border-slate-100">
                      <td className="py-2 pr-2">
                        <p className="font-medium text-slate-800">{displayName(i.producto)}</p>
                        <p className="text-sm text-slate-500">${i.precioCongelado.toFixed(2)} c/u</p>
                      </td>
                      <td className="py-2 pr-2">
                        <div className="inline-flex items-center gap-1.5">
                          <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad - 1)} className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Minus size={16} /></button>
                          <span className="w-9 text-center font-medium text-base tabular-nums">{i.cantidad}</span>
                          <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad + 1)} className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Plus size={16} /></button>
                        </div>
                      </td>
                      <td className="py-2 pr-2 text-right text-base tabular-nums font-semibold">${i.subtotal.toFixed(2)}</td>
                      <td className="py-2 text-center">
                        <button onClick={() => setItems(items.filter(x => x.producto.codigo !== i.producto.codigo))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="shrink-0 mt-4 pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg text-slate-600">Total</span>
                <span className="text-3xl font-bold text-slate-800 tabular-nums">${total.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><User size={18} /> Nombre del cliente <span className="text-red-500">*</span></label>
                  <input type="text" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} placeholder="Nombre y apellido" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Phone size={18} /> Contacto (teléfono o email) <span className="text-red-500">*</span></label>
                  <input type="text" value={contacto} onChange={e => setContacto(e.target.value)} placeholder="Ej: 0376-154567890 o luciam@mail.com" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><IdCard size={18} /> DNI <span className="text-red-500">*</span></label>
                  <input type="text" value={dni} onChange={e => setDni(e.target.value)} placeholder="DNI del cliente" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                </div>
              </div>

              <button onClick={confirmarPedido} className="w-full px-4 py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg flex items-center justify-center gap-2">
                <ShoppingCart size={22} /> Confirmar Pedido — ${total.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
