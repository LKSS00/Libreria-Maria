import { useState } from 'react';
import { productosMock, buscarProductos, pedidosMock } from '../data/mockData';
import type { Producto, ItemCarrito } from '../types';

export default function RealizarPedido() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [nombreCliente, setNombreCliente] = useState('Verónica Preste');
  const [contactoCliente, setContactoCliente] = useState('veronica@libreriamaria.com');
  const [descuento, setDescuento] = useState(0);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [error, setError] = useState('');
  const [pedidoNro, setPedidoNro] = useState(0);
  const [verCatalogo, setVerCatalogo] = useState(false);

  const handleBuscar = () => {
    if (!busqueda.trim()) return;
    setResultados(buscarProductos(busqueda).filter(p => p.stockActual > 0));
  };

  const agregarAlCarrito = (p: Producto) => {
    setError('');
    const existente = items.find(i => i.producto.codigo === p.codigo);
    if (existente) {
      setItems(items.map(i =>
        i.producto.codigo === p.codigo ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      if (p.stockActual < 1) { setError(`"${p.nombre}" no tiene stock disponible.`); return; }
      setItems([...items, { producto: p, cantidad: 1, precioCongelado: p.precioVenta }]);
    }
    setBusqueda('');
    setResultados([]);
  };

  const cambiarCantidad = (codigo: string, cant: number) => {
    setError('');
    if (cant < 1) { setItems(items.filter(i => i.producto.codigo !== codigo)); return; }
    const p = items.find(i => i.producto.codigo === codigo);
    if (p && cant > p.producto.stockActual) { setError(`Stock insuficiente. Máximo: ${p.producto.stockActual}`); return; }
    setItems(items.map(i => i.producto.codigo === codigo ? { ...i, cantidad: cant } : i));
  };

  const subtotal = items.reduce((sum, i) => sum + i.cantidad * i.precioCongelado, 0);
  const descuentoAplicado = subtotal * (descuento / 100);
  const total = subtotal - descuentoAplicado;

  const confirmarPedido = () => {
    setError('');
    if (!nombreCliente.trim() || !contactoCliente.trim()) { setError('Complete los datos del cliente.'); return; }
    if (items.length === 0) { setError('El carrito está vacío.'); return; }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (!p || p.stockActual < item.cantidad) { setError(`Stock insuficiente para "${item.producto.nombre}".`); return; }
    }
    for (const item of items) {
      const p = productosMock.find(pr => pr.codigo === item.producto.codigo);
      if (p) p.stockActual -= item.cantidad;
    }
    const nro = Math.floor(Math.random() * 9000) + 1000;
    setPedidoNro(nro);
    setMostrarComprobante(true);
  };

  const nuevoPedido = () => {
    setItems([]); setBusqueda(''); setResultados([]);
    setNombreCliente('Verónica Preste'); setContactoCliente('veronica@libreriamaria.com');
    setDescuento(0); setMostrarComprobante(false); setError('');
  };

  if (mostrarComprobante) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">📄</div>
            <h2 className="text-lg font-semibold text-slate-800">Pedido Confirmado</h2>
            <p className="text-sm text-slate-500">Librería María — Pedido Web</p>
          </div>
          <div className="border-t border-b border-slate-200 py-3 mb-4 text-sm space-y-1">
            <p><strong>N° Pedido:</strong> {pedidoNro}</p>
            <p><strong>Fecha:</strong> {new Date().toLocaleString('es-AR')}</p>
            <p><strong>Cliente:</strong> {nombreCliente}</p>
            <p><strong>Contacto:</strong> {contactoCliente}</p>
            <p><strong>Estado:</strong> <span className="text-yellow-600 font-medium">Pendiente de confirmación</span></p>
          </div>
          <table className="w-full text-sm mb-4">
            <thead><tr className="border-b border-slate-200"><th className="text-left py-2">Producto</th><th className="text-center py-2">Cant.</th><th className="text-right py-2">P. Unit.</th><th className="text-right py-2">Subtotal</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.producto.codigo} className="border-b border-slate-100">
                  <td className="py-2">{i.producto.nombre}</td>
                  <td className="text-center py-2">{i.cantidad}</td>
                  <td className="text-right py-2">${i.precioCongelado.toFixed(2)}</td>
                  <td className="text-right py-2">${(i.cantidad * i.precioCongelado).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {descuento > 0 && <div className="text-right text-sm text-slate-500 mb-1">Descuento ({descuento}%): -${descuentoAplicado.toFixed(2)}</div>}
          <div className="text-right text-xl font-bold text-slate-800 mb-6">Total: ${total.toFixed(2)}</div>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">
            El stock ha sido comprometido/reservado. El pedido queda en estado "Pendiente" hasta que el empleado lo confirme.
          </div>
          <button onClick={nuevoPedido} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Nuevo Pedido</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Realizar Pedido</h2>
          <button onClick={() => setVerCatalogo(!verCatalogo)} className="text-sm text-blue-600 hover:text-blue-800 underline">
            {verCatalogo ? 'Ocultar catálogo' : 'Ver catálogo de productos'}
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}

        {/* Catálogo completo */}
        {verCatalogo && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Catálogo de productos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productosMock.filter(p => p.stockActual > 0).map(p => (
                <div key={p.codigo} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between hover:border-blue-300 cursor-pointer" onClick={() => agregarAlCarrito(p)}>
                  <div>
                    <p className="font-medium text-slate-800">{p.nombre}</p>
                    <p className="text-xs text-slate-500">{p.categoria} | Stock: {p.stockActual}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">${p.precioVenta.toFixed(2)}</p>
                    <p className="text-xs text-green-600">Click +</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos pendientes del cliente */}
        {pedidosMock.filter(p => p.estado === 'Pendiente').length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-700 mb-2">📋 Mis pedidos pendientes</h4>
            {pedidosMock.filter(p => p.estado === 'Pendiente').map(p => (
              <div key={p.id} className="text-sm text-yellow-600 flex justify-between border-b border-yellow-100 py-1 last:border-0">
                <span>N° {p.id} — {p.items.length} producto(s)</span>
                <span className="font-medium">${p.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Datos del cliente */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input type="text" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} placeholder="Nombre y apellido" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contacto <span className="text-red-500">*</span></label>
            <input type="text" value={contactoCliente} onChange={e => setContactoCliente(e.target.value)} placeholder="Email o teléfono" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* Buscador */}
        <div className="flex gap-2 mb-4">
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} placeholder="Buscar productos del catálogo..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={handleBuscar} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Buscar</button>
        </div>

        {resultados.length > 0 && (
          <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {resultados.map(p => (
              <div key={p.codigo} className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-0 cursor-pointer" onClick={() => agregarAlCarrito(p)}>
                <div><p className="font-medium text-slate-800">{p.nombre}</p><p className="text-xs text-slate-500">Stock disp: {p.stockActual}</p></div>
                <p className="font-semibold text-blue-600">${p.precioVenta.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Carrito de compras:</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200"><th className="text-left py-2">Producto</th><th className="text-center py-2">Cantidad</th><th className="text-right py-2">Precio</th><th className="text-right py-2">Subtotal</th><th></th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.producto.codigo} className="border-b border-slate-100">
                    <td className="py-2">{i.producto.nombre}</td>
                    <td className="text-center py-2">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad - 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200">-</button>
                        <span className="w-8 text-center font-medium">{i.cantidad}</span>
                        <button onClick={() => cambiarCantidad(i.producto.codigo, i.cantidad + 1)} className="w-7 h-7 bg-slate-100 rounded hover:bg-slate-200">+</button>
                      </div>
                    </td>
                    <td className="text-right py-2">${i.precioCongelado.toFixed(2)}</td>
                    <td className="text-right py-2">${(i.cantidad * i.precioCongelado).toFixed(2)}</td>
                    <td className="text-center py-2"><button onClick={() => setItems(items.filter(x => x.producto.codigo !== i.producto.codigo))} className="text-red-500 hover:text-red-700 text-xs">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Descuento:</label>
                <select value={descuento} onChange={e => setDescuento(parseInt(e.target.value))} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm">
                  <option value={0}>0%</option><option value={5}>5%</option><option value={10}>10%</option><option value={15}>15%</option><option value={20}>20%</option>
                </select>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Subtotal: ${subtotal.toFixed(2)}</p>
                {descuento > 0 && <p className="text-sm text-green-600">Dto. {descuento}%: -${descuentoAplicado.toFixed(2)}</p>}
                <p className="text-xl font-bold text-slate-800">Total: ${total.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={confirmarPedido} className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-lg">Confirmar Pedido</button>
          </div>
        )}

        {items.length === 0 && !resultados.length && !verCatalogo && (
          <div className="text-center py-8 text-slate-400">Busque productos o vea el catálogo completo para agregar a su carrito.</div>
        )}
      </div>
      <div className="text-xs text-slate-400 text-center">
        Contrato: realizarPedido(datosCliente, listaItems) — UC-10 Realizar Pedido
      </div>
    </div>
  );
}
