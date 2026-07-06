import jsPDF from 'jspdf';

interface ComprobanteItem {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface ComprobanteData {
  titulo: string;
  numero: number;
  cliente: string;
  direccion?: string;
  items: ComprobanteItem[];
  total: number;
  fecha: Date;
  etiquetaCliente?: string;
}

export function generarPDF(data: ComprobanteData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 20;
  const yStart = 20;
  let y = yStart;

  const line = (yPos: number) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  const thickLine = (yPos: number) => {
    doc.setDrawColor(0);
    doc.setLineWidth(1.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Librería María', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Av. 9 de Julio 1200 — Apóstoles, Misiones', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Tel: xxx | xxx@gmail.com', pageWidth / 2, y, { align: 'center' });
  y += 4;
  thickLine(y);
  y += 6;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(data.titulo, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Info block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`N° Comprobante: ${data.numero}`, margin, y);
  doc.text(`Fecha: ${data.fecha.toLocaleDateString('es-AR')}`, margin + 90, y);
  y += 5;
  doc.text(`${data.etiquetaCliente ?? 'Cliente'}: ${data.cliente}`, margin, y);
  doc.text(`Hora: ${data.fecha.toLocaleTimeString('es-AR')}`, margin + 90, y);
  y += 5;
  if (data.direccion) {
    doc.text(`Dirección de entrega: ${data.direccion}`, margin, y);
    y += 5;
  }
  line(y);
  y += 5;

  // Table header
  const col1 = margin;
  const col2 = margin + 90;
  const col3 = margin + 130;
  const col4 = margin + 160;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Producto', col1, y);
  doc.text('Cant.', col2, y);
  doc.text('P. Unit.', col3, y);
  doc.text('Subtotal', col4, y);
  y += 4;
  thickLine(y);
  y += 3;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const item of data.items) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(item.producto, col1, y);
    doc.text(String(item.cantidad), col2, y);
    doc.text(`$${item.precioUnitario.toFixed(2)}`, col3, y);
    doc.text(`$${item.subtotal.toFixed(2)}`, col4, y);
    y += 5;
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3;
  }

  // Total
  y += 2;
  thickLine(y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total: $${data.total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${data.items.length} ${data.items.length === 1 ? 'producto' : 'productos'}`, pageWidth - margin, y, { align: 'right' });

  // Footer
  y = 278;
  doc.setFontSize(8);
  doc.setTextColor(100);
  line(y);
  y += 4;
  doc.text('Gracias por su compra. Librería María — Fundada en 1985', pageWidth / 2, y, { align: 'center' });

  doc.save(`comprobante-${data.numero}.pdf`);
}

export function imprimirComprobante() {
  window.print();
}
