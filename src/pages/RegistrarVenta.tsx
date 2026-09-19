import { useMemo, useState } from 'react';
import { productosMock, buscarProductos, buscarCliente, ventasMock, mediosPagoMock } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Producto, DetalleVenta, Cliente, MedioPago, Venta, Usuario } from '../types';
import { Search, Plus, Minus, Trash2, Receipt, History, CreditCard, CheckCircle, Printer, Download, PackageSearch, UserCheck, UserX } from 'lucide-react';
import { generarPDF, imprimirComprobante } from '../utils/pdfComprobante';
import { useToast } from '../components/Toast';

function displayName(p: Producto) {
  return `${p.nombre} — ${p.subcategoria}`;
}

export function registrarVenta(
  listaItems: DetalleVenta[],
  unEmpleado: Usuario,
  unCliente: Cliente,
  unMedioPago: MedioPago
): Venta {
  for (const item of listaItems) {
    const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
    if (p) p.stockActual -= item.cantidad;
  }
  const total = listaItems.reduce((sum, i) => sum + i.subtotal, 0);
  const venta: Venta = {
    numero: Math.floor(Math.random() * 9000) + 1000,
    fechaHora: new Date(),
    items: listaItems,
    total,
    empleado: unEmpleado,
    cliente: unCliente,
    medioPago: unMedioPago,
    estado: 'Cobrada',
  };
  ventasMock.push(venta);
  return venta;
}

export default function RegistrarVenta() {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [busqueda, setBusqueda] = useState('');
  const resultados = useMemo(
    () => (busqueda.trim() ? buscarProductos(busqueda).filter(p => p.stockActual > 0) : []),
    [busqueda]
  );
  const [items, setItems] = useState<DetalleVenta[]>([]);
  const [medioPago, setMedioPago] = useState<MedioPago>(mediosPagoMock[0]);
  const [clienteDni, setClienteDni] = useState('');
  const [clienteValido, setClienteValido] = useState<Cliente | null>(null);
  const [clienteError, setClienteError] = useState('');
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [error, setError] = useState('');

  const mostrarError = (msg: string) => {
    setError(msg);
    toastError(msg);
  };

  const agregarItem = (p: Producto) => {
    setError('');
    const existente = items.find(i => i.producto.codigo === p.codigo);
    if (existente) {
      if (existente.cantidad + 1 > p.stockActual) { mostrarError(`Stock insuficiente. Disponible: ${p.stockActual}`); return; }
      setItems(items.map(i => i.producto.codigo === p.codigo ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioCongelado } : i));
    } else {
      if (1 > p.stockActual) { mostrarError(`Stock insuficiente para "${displayName(p)}".`); return; }
      setItems([...items, { producto: p, cantidad: 1, precioCongelado: p.precioVenta, subtotal: p.precioVenta }]);
    }
    setBusqueda('');
  };

  const cambiarCantidad = (codigo: string, nuevaCant: number) => {
    setError('');
    if (nuevaCant < 1) { setItems(items.filter(i => i.producto.codigo !== codigo)); return; }
    const p = items.find(i => i.producto.codigo === codigo);
    if (p && nuevaCant > p.producto.stockActual) { mostrarError(`Stock insuficiente. Máximo: ${p.producto.stockActual}`); return; }
    setItems(items.map(i => i.producto.codigo === codigo ? { ...i, cantidad: nuevaCant, subtotal: nuevaCant * i.precioCongelado } : i));
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const verificarCliente = () => {
    setClienteError('');
    setClienteValido(null);
    const dni = clienteDni.trim();
    if (!dni) { setClienteError('Ingrese un DNI para verificar.'); return; }
    const c = buscarCliente(dni);
    if (c) setClienteValido(c);
    else {
      setClienteError('No se encontró un cliente con ese DNI.');
      toastError('No se encontró un cliente con ese DNI.');
    }
  };

  const confirmarVenta = () => {
    setError('');
    if (items.length === 0) { mostrarError('Agregue al menos un producto.'); return; }
    if (!clienteValido) { mostrarError('Verifique un cliente válido (DNI) antes de confirmar la venta.'); return; }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (!p || p.stockActual < item.cantidad) { mostrarError(`Stock insuficiente para "${displayName(item.producto)}".`); return; }
    }
    if (!user) { mostrarError('Empleado no identificado.'); return; }
    registrarVenta(items, user, clienteValido, medioPago);
    setMostrarComprobante(true);
  };

  const nuevaVenta = () => { setItems([]); setMedioPago(mediosPagoMock[0]); setClienteDni(''); setClienteValido(null); setClienteError(''); setMostrarComprobante(false); setError(''); setBusqueda(''); };

  if (mostrarComprobante) {
    const nroVenta = Math.floor(Math.random() * 9000) + 1000;

    const handleDownloadPDF = () => {
      generarPDF({
        titulo: 'COMPROBANTE DE VENTA',
        numero: nroVenta,
        cliente: user?.nombreReal ?? '—',
        items: items.map(i => ({
          producto: displayName(i.producto),
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
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div id="comprobante-print" className="bg-white rounded-xl border border-slate-200 p-7">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Times New Roman', serif" }}>Librería María</div>
              <p className="text-sm text-slate-500 mt-1">Av. 9 de Julio 1200 — Apóstoles, Misiones</p>
              <p className="text-sm text-slate-500">Tel: xxx | xxx@gmail.com</p>
              <hr className="my-3 border-t-2 border-slate-800" />
              <h2 className="text-xl font-bold text-slate-800 tracking-wide uppercase">Comprobante de Venta</h2>
            </div>
            <div className="text-base space-y-1 mb-4 pb-3 border-b border-slate-300">
              <div className="flex justify-between">
                <span><strong>N° Venta:</strong> {nroVenta}</span>
                <span><strong>Fecha:</strong> {new Date().toLocaleDateString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Vendedor:</strong> {user?.nombreReal}</span>
                <span><strong>Hora:</strong> {new Date().toLocaleTimeString('es-AR')}</span>
              </div>
              <p><strong>Medio de pago:</strong> {medioPago.nombre}</p>
              <p><strong>Cliente:</strong> {clienteValido?.nombre} — DNI {clienteValido?.dni}</p>
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
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-base mb-4 flex items-center gap-2 justify-center no-print"><CheckCircle size={18} /> Venta registrada y stock actualizado.</div>
            <div className="flex flex-col sm:flex-row gap-3 no-print">
              <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-base">
                <Download size={18} /> Descargar PDF
              </button>
              <button onClick={imprimirComprobante} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-base">
                <Printer size={18} /> Imprimir
              </button>
              <button onClick={nuevaVenta} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-base">
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-12 gap-5">
      {/* Panel 1 — Búsqueda de productos */}
      <section className="col-span-4 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center gap-2 mb-4">
          <PackageSearch size={22} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Productos</h2>
        </header>

        <div className="flex items-center gap-2 mb-4 shrink-0">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Nombre, subcategoría o código..."
            className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="text-base text-slate-400 hover:text-slate-600 shrink-0">
              Limpiar
            </button>
          )}
        </div>

        {error && <div className="mb-3 shrink-0 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-base">{error}</div>}

        <div className="flex-1 min-h-0 overflow-y-auto">
          {resultados.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {resultados.map(p => (
                <div key={p.codigo} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors" onClick={() => agregarItem(p)}>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-base truncate">{displayName(p)}</p>
                    <p className="text-sm text-slate-500">Stock: {p.stockActual} | Cód: {p.codigo}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="font-semibold text-blue-600 text-base">${p.precioVenta.toFixed(2)}</p>
                    <p className="text-sm text-green-600 flex items-center gap-0.5 justify-end"><Plus size={14} /> agregar</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <PackageSearch size={40} className="mb-2 opacity-40" />
              <p className="text-base text-center">
                {busqueda.trim() ? 'Sin resultados para su búsqueda.' : <>Busque productos para<br />comenzar la venta.</>}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Panel 2 — Carrito */}
      <section className="col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center gap-2 mb-4 shrink-0">
          <Receipt size={22} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Nueva Venta</h2>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Receipt size={44} className="mb-2 opacity-40" />
            <p className="text-base text-center">Seleccione productos para<br />armar la venta.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-left">
                    <th className="py-2 pr-2">Producto</th>
                    <th className="py-2 pr-2 text-center">Cantidad</th>
                    <th className="py-2 pr-2 text-right">Subtotal</th>
                    <th className="py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.producto.codigo} className="border-b border-slate-100">
                      <td className="py-2.5 pr-2">
                        <p className="font-medium text-slate-800">{displayName(i.producto)}</p>
                        <p className="text-sm text-slate-500">${i.precioCongelado.toFixed(2)} c/u</p>
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="inline-flex items-center gap-1.5">
                          <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad - 1)} className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Minus size={16} /></button>
                          <span className="w-9 text-center font-medium text-base tabular-nums">{i.cantidad}</span>
                          <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad + 1)} className="w-8 h-8 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center"><Plus size={16} /></button>
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-right text-base tabular-nums font-semibold">${i.subtotal.toFixed(2)}</td>
                      <td className="py-2.5 text-center">
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

              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-slate-700 flex items-center gap-1.5 shrink-0"><CreditCard size={16} /> Pago</span>
                <div className="flex gap-4">
                  {mediosPagoMock.map(m => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="medioPago" checked={medioPago.id === m.id} onChange={() => setMedioPago(m)} className="accent-blue-600 w-4 h-4" />
                      <span className="text-base capitalize">{m.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-base font-medium text-slate-700 mb-2">Verificar cliente (DNI)</p>
                <div className="flex gap-2">
                  <input
                    type="text" value={clienteDni} onChange={e => setClienteDni(e.target.value)}
                    onKeyDown={e => {
                      if (e.key !== 'Enter') return;
                      if (clienteValido && items.length > 0) { e.preventDefault(); confirmarVenta(); }
                      else verificarCliente();
                    }}
                    placeholder="Ingrese el DNI del cliente" className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
                  />
                  <button type="button" onClick={verificarCliente} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base shrink-0">
                    <UserCheck size={18} /> Verificar
                  </button>
                </div>
                {clienteValido && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-base">
                    <CheckCircle size={18} />
                    <span className="font-medium">{clienteValido.nombre}</span>
                    <span className="text-sm text-green-600">DNI {clienteValido.dni} — {clienteValido.telefono}</span>
                  </div>
                )}
                {clienteError && (
                  <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-base">
                    <UserX size={18} /> {clienteError}
                  </div>
                )}
              </div>

              <button onClick={confirmarVenta} className="w-full px-4 py-3.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg flex items-center justify-center gap-2">
                <CheckCircle size={22} /> Confirmar Venta — ${total.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Panel 3 — Historial */}
      <section className="col-span-3 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center gap-2 mb-4 shrink-0">
          <History size={22} className="text-purple-600" />
          <h2 className="text-xl font-semibold text-slate-800">Historial de ventas</h2>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left">
                <th className="py-2 pr-2">N°</th>
                <th className="py-2 pr-2">Fecha</th>
                <th className="py-2 pr-2">Cliente</th>
                <th className="py-2 pr-2">Pago</th>
                <th className="py-2 pr-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasMock.map(v => (
                <tr key={v.numero} className="border-b border-slate-100">
                  <td className="py-2.5 pr-2 font-mono">{v.numero}</td>
                  <td className="py-2.5 pr-2 text-sm text-slate-500">{v.fechaHora.toLocaleDateString('es-AR')}</td>
                  <td className="py-2.5 pr-2 text-sm text-slate-600">{v.cliente.nombre}</td>
                  <td className="py-2.5 pr-2 text-sm capitalize text-slate-600">{v.medioPago.nombre}</td>
                  <td className="py-2.5 pr-2 text-right font-medium tabular-nums">${v.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
