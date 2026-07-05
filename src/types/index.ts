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

export interface Producto {
  codigo: string;
  nombre: string;
  categoria: string;
  precioCosto: number;
  precioVenta: number;
  stockActual: number;
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
  idEmpleado: number;
  idCliente?: string;
  medioPago: string;
  estado: 'Cobrada' | 'Cancelada';
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  precioCongelado: number;
}

export interface Pedido {
  id: number;
  cliente: { nombre: string; contacto: string; dni?: string };
  items: ItemCarrito[];
  total: number;
  descuento: number;
  fecha: Date;
  estado: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Entregado';
  direccionEntrega?: string;
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
