import type { Producto, Proveedor, Usuario, Venta, MovimientoStock, Pedido } from '../types';

export const usuariosMock: Usuario[] = [
  { id: 1, username: 'admin', password: 'admin123', nombreReal: 'María Preste', rol: 'admin' },
  { id: 2, username: 'empleado', password: 'empleado123', nombreReal: 'Juan Pérez', rol: 'empleado' },
  { id: 3, username: 'repositor', password: 'repo123', nombreReal: 'Carlos Gómez', rol: 'repositor' },
  { id: 4, username: 'cliente', password: 'cliente123', nombreReal: 'Verónica Preste', rol: 'cliente' },
];

export const proveedoresMock: Proveedor[] = [
  { id: 1, nombreEmpresa: 'Distribuidora Norte', telefono: '0376-4435123', direccion: 'Av. Mitre 350' },
  { id: 2, nombreEmpresa: 'Faber-Castell Argentina', telefono: '011-4765321', direccion: 'Buenos Aires' },
  { id: 3, nombreEmpresa: 'Papelera del Valle', telefono: '0376-4420891', direccion: 'Córdoba 120' },
  { id: 4, nombreEmpresa: 'Maxim Oficinas', telefono: '0376-4432777', direccion: 'San Martín 800' },
];

export const productosMock: Producto[] = [
  { codigo: '779001', nombre: 'Pegamento Voligoma', subcategoria: '50ml', categoria: 'Escolar', precioCosto: 250, precioVenta: 600, stockActual: 30, stockMinimo: 10, idProveedor: 1 },
  { codigo: '779002', nombre: 'Pegamento Voligoma', subcategoria: '150ml', categoria: 'Escolar', precioCosto: 450, precioVenta: 1100, stockActual: 18, stockMinimo: 10, idProveedor: 1 },
  { codigo: '779003', nombre: 'Cuaderno Rivadavia A4', subcategoria: '48 hojas', categoria: 'Escolar', precioCosto: 850, precioVenta: 1700, stockActual: 48, stockMinimo: 10, idProveedor: 1 },
  { codigo: '779004', nombre: 'Cuaderno Rivadavia A4', subcategoria: '96 hojas', categoria: 'Escolar', precioCosto: 1200, precioVenta: 2500, stockActual: 22, stockMinimo: 8, idProveedor: 1 },
  { codigo: '779005', nombre: 'Lapicera BIC', subcategoria: 'azul', categoria: 'Escolar', precioCosto: 120, precioVenta: 350, stockActual: 197, stockMinimo: 50, idProveedor: 2 },
  { codigo: '779006', nombre: 'Lapicera BIC', subcategoria: 'roja', categoria: 'Escolar', precioCosto: 120, precioVenta: 350, stockActual: 85, stockMinimo: 30, idProveedor: 2 },
  { codigo: '779007', nombre: 'Lapicera BIC', subcategoria: 'negra', categoria: 'Escolar', precioCosto: 120, precioVenta: 350, stockActual: 112, stockMinimo: 30, idProveedor: 2 },
  { codigo: '779008', nombre: 'Resma A4 Autor', subcategoria: '500 hojas', categoria: 'Oficina', precioCosto: 2500, precioVenta: 5200, stockActual: 28, stockMinimo: 5, idProveedor: 3 },
  { codigo: '779009', nombre: 'Goma de borrar Milan', subcategoria: 'chica', categoria: 'Escolar', precioCosto: 80, precioVenta: 250, stockActual: 12, stockMinimo: 20, idProveedor: 1 },
  { codigo: '779010', nombre: 'Goma de borrar Milan', subcategoria: 'grande', categoria: 'Escolar', precioCosto: 150, precioVenta: 400, stockActual: 7, stockMinimo: 10, idProveedor: 1 },
  { codigo: '779011', nombre: 'Carpeta oficio cartón', subcategoria: 'tapa dura', categoria: 'Escolar', precioCosto: 300, precioVenta: 700, stockActual: 38, stockMinimo: 10, idProveedor: 1 },
  { codigo: '779012', nombre: 'Tijera escolar', subcategoria: '16cm', categoria: 'Escolar', precioCosto: 350, precioVenta: 900, stockActual: 23, stockMinimo: 8, idProveedor: 2 },
  { codigo: '779013', nombre: 'Correcto líquido', subcategoria: '20ml', categoria: 'Oficina', precioCosto: 200, precioVenta: 550, stockActual: 58, stockMinimo: 15, idProveedor: 3 },
  { codigo: '779014', nombre: 'Bolígrafo Parker', subcategoria: 'azul', categoria: 'Oficina', precioCosto: 1200, precioVenta: 2800, stockActual: 10, stockMinimo: 5, idProveedor: 4 },
  { codigo: '779015', nombre: 'Acuarela 12 colores', subcategoria: 'estuche', categoria: 'Artística', precioCosto: 600, precioVenta: 1500, stockActual: 6, stockMinimo: 10, idProveedor: 2 },
  { codigo: '779016', nombre: 'Lápiz HB', subcategoria: 'N°2', categoria: 'Escolar', precioCosto: 60, precioVenta: 200, stockActual: 297, stockMinimo: 50, idProveedor: 1 },
];

export const ventasMock: Venta[] = [
  {
    numero: 1001, fechaHora: new Date('2025-11-21T10:30:00'),
    items: [
      { producto: productosMock[2], cantidad: 2, precioCongelado: 1700, subtotal: 3400 },
      { producto: productosMock[4], cantidad: 5, precioCongelado: 350, subtotal: 1750 },
    ],
    total: 5150, idEmpleado: 2, medioPago: 'efectivo', estado: 'Cobrada',
  },
  {
    numero: 1002, fechaHora: new Date('2025-11-21T11:15:00'),
    items: [
      { producto: productosMock[7], cantidad: 1, precioCongelado: 5200, subtotal: 5200 },
    ],
    total: 5200, idEmpleado: 2, medioPago: 'tarjeta', estado: 'Cobrada',
  },
  {
    numero: 1003, fechaHora: new Date('2025-11-22T09:45:00'),
    items: [
      { producto: productosMock[15], cantidad: 10, precioCongelado: 200, subtotal: 2000 },
      { producto: productosMock[8], cantidad: 3, precioCongelado: 250, subtotal: 750 },
    ],
    total: 2750, idEmpleado: 1, medioPago: 'efectivo', estado: 'Cobrada',
  },
  {
    numero: 1004, fechaHora: new Date('2025-11-22T16:20:00'),
    items: [
      { producto: productosMock[10], cantidad: 2, precioCongelado: 700, subtotal: 1400 },
      { producto: productosMock[11], cantidad: 1, precioCongelado: 900, subtotal: 900 },
      { producto: productosMock[12], cantidad: 3, precioCongelado: 550, subtotal: 1650 },
    ],
    total: 3950, idEmpleado: 2, medioPago: 'transferencia', estado: 'Cobrada',
  },
];

export const movimientosStockMock: MovimientoStock[] = [
  { id: 1, idProducto: '779009', cantidadAnterior: 18, cantidadNueva: 12, motivo: 'Corrección de conteo', idUsuario: 3, fecha: new Date('2025-11-20T08:00:00') },
  { id: 2, idProducto: '779008', cantidadAnterior: 25, cantidadNueva: 30, motivo: 'Ingreso proveedor', idUsuario: 1, fecha: new Date('2025-11-19T14:30:00') },
  { id: 3, idProducto: '779015', cantidadAnterior: 10, cantidadNueva: 6, motivo: 'Rotura', idUsuario: 3, fecha: new Date('2025-11-18T10:00:00') },
  { id: 4, idProducto: '779003', cantidadAnterior: 45, cantidadNueva: 55, motivo: 'Ingreso proveedor', idUsuario: 1, fecha: new Date('2025-11-17T11:00:00') },
];

export const pedidosMock: Pedido[] = [
  {
    id: 504, cliente: { nombre: 'Lucía Martínez', contacto: 'lucia@mail.com' },
    items: [
      { producto: productosMock[2], cantidad: 3, precioCongelado: 1700 },
      { producto: productosMock[15], cantidad: 12, precioCongelado: 200 },
    ],
    total: 7500, descuento: 0, fecha: new Date('2025-11-22T18:00:00'), estado: 'Pendiente',
  },
  {
    id: 505, cliente: { nombre: 'Pedro López', contacto: 'pedro@mail.com' },
    items: [
      { producto: productosMock[13], cantidad: 1, precioCongelado: 2800 },
      { producto: productosMock[12], cantidad: 2, precioCongelado: 550 },
    ],
    total: 3900, descuento: 0, fecha: new Date('2025-11-22T19:30:00'), estado: 'Pendiente',
  },
];

export const obtenerProveedor = (id: number): Proveedor | undefined =>
  proveedoresMock.find(p => p.id === id);

export const obtenerProducto = (codigo: string): Producto | undefined =>
  productosMock.find(p => p.codigo === codigo);

export const buscarProductos = (q: string): Producto[] => {
  const term = q.toLowerCase();
  return productosMock.filter(
    p => p.nombre.toLowerCase().includes(term) || p.subcategoria.toLowerCase().includes(term) || p.codigo.includes(term)
  );
};

export const productosConStockBajo = (): Producto[] =>
  productosMock.filter(p => p.stockActual <= p.stockMinimo);
