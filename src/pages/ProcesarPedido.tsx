import { useState } from 'react';
import { productosMock, pedidosMock, ventasMock, mediosPagoMock, buscarCliente } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Pedido, ItemCarrito, Cliente, MedioPago, Venta, Usuario } from '../types';
import { PackageCheck, ClipboardList, XCircle, CheckCircle, User, Phone, IdCard, Receipt, History, Download, Printer } from 'lucide-react';
import { useToast } from '../components/Toast';
import { generarPDF, imprimirComprobante } from '../utils/pdfComprobante';

export function procesarPedido(
  unPedido: Pedido,
  unEmpleado: Usuario,
  unMedioPago: MedioPago
): Venta {
  if (unPedido.estado !== 'Pendiente') {
    throw new Error('El pedido no está pendiente de proceso.');
  }

  const clienteExistente = buscarCliente(unPedido.cliente.dni);
  const unCliente: Cliente = clienteExistente ?? {
    dni: unPedido.cliente.dni,
    nombre: unPedido.cliente.nombre,
    telefono: unPedido.cliente.contacto,
    email: unPedido.cliente.contacto.includes('@') ? unPedido.cliente.contacto : '',
  };

  for (const item of unPedido.items) {
    const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
    if (!p || p.stockActual < item.cantidad) {
      throw new Error(`Stock insuficiente para formalizar "${item.producto.nombre}".`);
    }
    p.stockActual -= item.cantidad;
    p.stockReservado -= item.cantidad;
  }

  unPedido.estado = 'Confirmado';

  const venta: Venta = {
    numero: Math.max(0, ...ventasMock.map(v => v.numero)) + 1,
    fechaHora: new Date(),
    items: unPedido.items.map(i => ({
      producto: i.producto,
      cantidad: i.cantidad,
      precioCongelado: i.precioCongelado,
      subtotal: i.subtotal,
    })),
    total: unPedido.total,
    empleado: unEmpleado,
    cliente: unCliente,
    medioPago: unMedioPago,
    estado: 'Cobrada',
  };
  ventasMock.push(venta);
  return venta;
}

export function cancelarPedidoWeb(unPedido: Pedido, unMotivo: string): Pedido {
  if (unPedido.estado !== 'Pendiente') {
    throw new Error('El pedido no está pendiente de cancelación.');
  }
  for (const item of unPedido.items) {
    const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
    if (p) p.stockReservado -= item.cantidad;
  }
  unPedido.estado = 'Cancelado';
  unPedido.motivoCancelacion = unMotivo.trim();
  return unPedido;
}

type Filtro = 'pendientes' | 'todos';

export default function ProcesarPedido() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [filtro, setFiltro] = useState<Filtro>('pendientes');
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);
  const [medioPago, setMedioPago] = useState<MedioPago>(mediosPagoMock[0]);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [, setVersion] = useState(0);

  const refresh = () => setVersion(v => v + 1);

  const pedidosVisibles = (filtro === 'pendientes' ? pedidosMock.filter(p => p.estado === 'Pendiente') : pedidosMock)
    .slice()
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const badgeEstado = (estado: Pedido['estado']) => {
    const map: Record<Pedido['estado'], string> = {
      Pendiente: 'bg-yellow-100 text-yellow-700',
      Confirmado: 'bg-green-100 text-green-700',
      Cancelado: 'bg-red-100 text-red-700',
      Entregado: 'bg-blue-100 text-blue-700',
    };
    return map[estado];
  };

  const handleConfirmar = () => {
    setError('');
    if (!seleccionado || !user) return;
    if (seleccionado.estado !== 'Pendiente') return;
    try {
      const venta = procesarPedido(seleccionado, user, medioPago);
      toastSuccess(`Pedido confirmado y formalizado como Venta N° ${venta.numero}. Stock comprometido.`);
      refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo procesar el pedido.';
      setError(msg);
      toastError(msg);
    }
  };

  const handleCancelar = () => {
    setError('');
    if (!seleccionado) return;
    if (seleccionado.estado !== 'Pendiente') return;
    if (!motivo.trim()) {
      const msg = 'Ingrese un motivo para cancelar el pedido.';
      setError(msg);
      toastError(msg);
      return;
    }
    cancelarPedidoWeb(seleccionado, motivo.trim());
    toastInfo('Pedido cancelado. Stock reservado liberado.');
    setMotivo('');
    refresh();
  };

  const handleDownloadPDF = () => {
    if (!seleccionado || seleccionado.estado !== 'Confirmado') return;
    // Buscamos el número de venta asociado (el más reciente de este cliente, o podríamos buscar en ventasMock)
    // Para simplificar, asumimos que se generó una venta con los mismos items.
    // Lo más correcto es encontrar la venta exacta, pero como maqueta, usamos el ID del pedido.
    const ventaRelacionada = ventasMock.slice().reverse().find(v => v.cliente.dni === seleccionado.cliente.dni && v.total === seleccionado.total);
    const nroComprobante = ventaRelacionada ? ventaRelacionada.numero : seleccionado.id;

    generarPDF({
      titulo: 'COMPROBANTE DE VENTA (PEDIDO WEB)',
      numero: nroComprobante,
      cliente: `${seleccionado.cliente.nombre} — DNI ${seleccionado.cliente.dni} — ${seleccionado.cliente.contacto}`,
      items: seleccionado.items.map(i => ({
        producto: `${i.producto.nombre} — ${i.producto.subcategoria}`,
        cantidad: i.cantidad,
        precioUnitario: i.precioCongelado,
        subtotal: i.subtotal,
      })),
      total: seleccionado.total,
      fecha: new Date(),
      etiquetaCliente: 'Cliente',
    });
  };

  const esItemValido = (i: ItemCarrito) => !!i.producto && i.cantidad > 0;

  return (
    <div className="h-full grid grid-cols-12 gap-5">
      {/* Panel izquierdo — Lista de pedidos */}
      <section className="col-span-7 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <PackageCheck size={22} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">Pedidos Web</h2>
          </div>
        </header>

        <div className="flex gap-1 mb-4 border-b border-slate-200 shrink-0">
          <button onClick={() => setFiltro('pendientes')}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-base font-semibold border-b-2 transition-colors ${filtro === 'pendientes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <ClipboardList size={18} /> Pendientes ({pedidosMock.filter(p => p.estado === 'Pendiente').length})
          </button>
          <button onClick={() => setFiltro('todos')}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-base font-semibold border-b-2 transition-colors ${filtro === 'todos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <History size={18} /> Historial
          </button>
        </div>

        {error && <div className="mb-3 shrink-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base">{error}</div>}

        <div className="flex-1 min-h-0 overflow-y-auto">
          {pedidosVisibles.length > 0 ? (
            <table className="w-full text-base">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-slate-200 text-left">
                  <th className="py-2 pr-2">N°</th>
                  <th className="py-2 pr-2">Fecha</th>
                  <th className="py-2 pr-2">Cliente</th>
                  <th className="py-2 pr-2 text-right">Total</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosVisibles.map(p => (
                  <tr key={p.id} onClick={() => setSeleccionado(p)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${seleccionado?.id === p.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="py-2.5 pr-2 font-mono">{p.id}</td>
                    <td className="py-2.5 pr-2 text-sm text-slate-500">{p.fecha.toLocaleDateString('es-AR')}</td>
                    <td className="py-2.5 pr-2 text-sm">{p.cliente.nombre}</td>
                    <td className="py-2.5 pr-2 text-right font-medium tabular-nums">${p.total.toFixed(2)}</td>
                    <td className="py-2.5"><span className={`text-sm px-2.5 py-0.5 rounded-full ${badgeEstado(p.estado)}`}>{p.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ClipboardList size={44} className="mb-2 opacity-40" />
              <p className="text-base text-center">No hay pedidos pendientes.<br />Los pedidos web aparecerán aquí.</p>
            </div>
          )}
        </div>
      </section>

      {/* Panel derecho — Detalle */}
      <section className="col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-0">
        {!seleccionado ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Receipt size={44} className="mb-2 opacity-40" />
            <p className="text-base text-center">Seleccione un pedido<br />para ver su detalle y procesarlo.</p>
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt size={22} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-800">Pedido N° {seleccionado.id}</h2>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${badgeEstado(seleccionado.estado)}`}>{seleccionado.estado}</span>
            </header>

            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 shrink-0">
              <p className="flex items-center gap-2 text-base text-slate-700"><User size={16} className="text-slate-400" /> <strong>{seleccionado.cliente.nombre}</strong></p>
              <p className="flex items-center gap-2 text-base text-slate-600"><Phone size={16} className="text-slate-400" /> {seleccionado.cliente.contacto}</p>
              <p className="flex items-center gap-2 text-base text-slate-600"><IdCard size={16} className="text-slate-400" /> DNI {seleccionado.cliente.dni}</p>
              <p className="text-sm text-slate-400 pt-1">{seleccionado.fecha.toLocaleString('es-AR')}</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto mb-4">
              <table className="w-full text-base">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-slate-200 text-left">
                    <th className="py-2 pr-2">Producto</th>
                    <th className="py-2 pr-2 text-center">Cant.</th>
                    <th className="py-2 pr-2 text-right">P. Unit.</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {seleccionado.items.filter(esItemValido).map(i => (
                    <tr key={i.producto.codigo} className="border-b border-slate-100">
                      <td className="py-2.5 pr-2">
                        <p className="font-medium text-slate-800">{i.producto.nombre}</p>
                        <p className="text-sm text-slate-500">{i.producto.subcategoria}</p>
                      </td>
                      <td className="py-2.5 pr-2 text-center tabular-nums">{i.cantidad}</td>
                      <td className="py-2.5 pr-2 text-right tabular-nums">${i.precioCongelado.toFixed(2)}</td>
                      <td className="py-2.5 text-right tabular-nums font-medium">${i.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="shrink-0 space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-lg text-slate-600">Total</span>
                <span className="text-3xl font-bold text-slate-800 tabular-nums">${seleccionado.total.toFixed(2)}</span>
              </div>

              {seleccionado.estado === 'Pendiente' ? (
                <>
                  <div>
                    <label className="block text-base font-medium text-slate-700 mb-2">Medio de pago al retiro</label>
                    <select value={medioPago.id} onChange={e => setMedioPago(mediosPagoMock.find(m => m.id === Number(e.target.value)) ?? mediosPagoMock[0])}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base capitalize">
                      {mediosPagoMock.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-slate-700 mb-2">Motivo de cancelación (solo si aplica)</label>
                    <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Cliente solicita cancelar el pedido..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleConfirmar} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-base">
                      <CheckCircle size={20} /> Confirmar Pedido
                    </button>
                    <button onClick={handleCancelar} className="flex items-center justify-center gap-1.5 px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-base">
                      <XCircle size={20} /> Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-600 text-center">
                    {seleccionado.estado === 'Confirmado'
                      ? 'Pedido formalizado como venta efectiva. El stock reservado fue comprometido.'
                      : seleccionado.estado === 'Cancelado'
                        ? `Pedido cancelado. El stock reservado fue liberado.${seleccionado.motivoCancelacion ? ` Motivo: ${seleccionado.motivoCancelacion}` : ''}`
                        : `Entregado al cliente.`}
                  </div>
                  {seleccionado.estado === 'Confirmado' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-base">
                        <Download size={18} /> Descargar PDF
                      </button>
                      <button onClick={imprimirComprobante} className="flex items-center justify-center gap-1.5 flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-base">
                        <Printer size={18} /> Imprimir
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Plantilla oculta para impresión */}
            {seleccionado.estado === 'Confirmado' && (
              <div className="hidden print:block">
                <div id="comprobante-print">
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Times New Roman', serif" }}>Librería María</div>
                    <p style={{ fontSize: '12px', marginTop: '4px' }}>Av. 9 de Julio 1200 — Apóstoles, Misiones</p>
                    <p style={{ fontSize: '12px' }}>Tel: xxx | xxx@gmail.com</p>
                    <hr style={{ margin: '12px 0', borderTop: '2px solid #000' }} />
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Comprobante de Venta (Web)</h2>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #ccc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>N° Pedido/Venta:</strong> {seleccionado.id}</span>
                      <span><strong>Fecha:</strong> {new Date().toLocaleDateString('es-AR')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>Cliente:</strong> {seleccionado.cliente.nombre}</span>
                      <span><strong>Hora:</strong> {new Date().toLocaleTimeString('es-AR')}</span>
                    </div>
                    <p><strong>DNI:</strong> {seleccionado.cliente.dni}</p>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Producto</th>
                        <th style={{ textAlign: 'center', padding: '8px 0' }}>Cant.</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>P. Unit.</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seleccionado.items.map(i => (
                        <tr key={i.producto.codigo} style={{ borderBottom: '1px solid #ccc' }}>
                          <td style={{ padding: '8px 0' }}>{i.producto.nombre}</td>
                          <td style={{ textAlign: 'center', padding: '8px 0' }}>{i.cantidad}</td>
                          <td style={{ textAlign: 'right', padding: '8px 0' }}>${i.precioCongelado.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '8px 0' }}>${i.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #000', paddingTop: '12px' }}>
                    <span>Total {seleccionado.items.length} {seleccionado.items.length === 1 ? 'producto' : 'productos'}</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>${seleccionado.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}