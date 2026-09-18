export type Rol = 'admin' | 'empleado' | 'repositor' | 'cliente';

export interface Usuario {
  id: number;
  username: string;
  password: string;
  nombreReal: string;
  rol: Rol;
}

export interface Proveedor {
  id: number;
  nombreEmpresa: string;
  telefono: string;
  direccion: string;
}

export interface Cliente {
  dni: string;
  nombre: string;
  telefono: string;
  email: string;
}

export interface MedioPago {
  id: number;
  nombre: 'efectivo' | 'tarjeta' | 'transferencia';
}

export interface Producto {
  codigo: string;
  nombre: string;
  subcategoria: string;
  categoria: string;
  precioCosto: number;
  precioVenta: number;
  stockActual: number;
  stockReservado: number;
  stockMinimo: number;
  idProveedor: number;
}

export interface DetalleVenta {
  producto: Producto;
  cantidad: number;
  precioCongelado: number;
  subtotal: number;
}

export interface Venta {
  numero: number;
  fechaHora: Date;
  items: DetalleVenta[];
  total: number;
  empleado: Usuario;
  cliente: Cliente;
  medioPago: MedioPago;
  estado: 'Cobrada' | 'Cancelada';
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  precioCongelado: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  cliente: { nombre: string; contacto: string; dni: string };
  items: ItemCarrito[];
  total: number;
  descuento: number;
  fecha: Date;
  estado: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Entregado';
  motivoCancelacion?: string;
}

export interface MovimientoStock {
  id: number;
  idProducto: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  motivo: string;
  idUsuario: number;
  fecha: Date;
}