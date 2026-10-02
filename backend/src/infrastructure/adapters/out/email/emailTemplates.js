const ESTADO_INICIAL = "Pendiente de Pago";

function escapar(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const dinero = (n) => `$${Number(n || 0).toFixed(2)}`;

function filasHtml(items = []) {
  return items
    .map((i) => {
      const subtotal = Number(i.precioUnitario) * Number(i.cantidad);
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapar(i.nombreProducto)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${escapar(i.cantidad)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${dinero(i.precioUnitario)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${dinero(subtotal)}</td>
      </tr>`;
    })
    .join("");
}

function filasTexto(items = []) {
  return items.map(
    (i) =>
      `- ${i.nombreProducto} x${i.cantidad} @ ${dinero(i.precioUnitario)} = ${dinero(
        Number(i.precioUnitario) * Number(i.cantidad),
      )}`,
  );
}

function tablaHtml(items, total) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead>
      <tr style="background:#f5f5f5">
        <th style="padding:8px;text-align:left">Producto</th>
        <th style="padding:8px">Cant.</th>
        <th style="padding:8px;text-align:right">Precio</th>
        <th style="padding:8px;text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${filasHtml(items)}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:8px;text-align:right"><strong>Total</strong></td>
        <td style="padding:8px;text-align:right"><strong>${dinero(total)}</strong></td>
      </tr>
    </tfoot>
  </table>`;
}

function envolver(contenido) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
    <h2 style="color:#1a56db">HexaMarket</h2>
    ${contenido}
  </div>`;
}

function plantillaComprobanteCliente({
  cliente,
  pedido,
  items,
  instruccionesPago,
}) {
  const estado = pedido.estado || ESTADO_INICIAL;
  const nombre = cliente.nombre || "cliente";

  const text = [
    `Hola ${nombre},`,
    `Tu pedido #${pedido.id} fue registrado con estado: ${estado}.`,
    "",
    "Detalle de tu compra:",
    ...filasTexto(items),
    `Total: ${dinero(pedido.total)}`,
    "",
    "Instrucciones de pago:",
    instruccionesPago,
    `Concepto de pago: Pedido #${pedido.id}`,
  ].join("\n");

  const html = envolver(`
    <p>Hola ${escapar(nombre)},</p>
    <p>Tu pedido <strong>#${escapar(pedido.id)}</strong> fue registrado con estado
       <strong>${escapar(estado)}</strong>.</p>
    ${tablaHtml(items, pedido.total)}
    <h3>Instrucciones de pago</h3>
    <p>${escapar(instruccionesPago).replace(/\n/g, "<br>")}</p>
    <p><strong>Concepto de pago:</strong> Pedido #${escapar(pedido.id)}</p>
  `);

  return {
    subject: `Comprobante de compra - Pedido #${pedido.id}`,
    text,
    html,
  };
}

function plantillaNuevoPedidoAdmin({ cliente, pedido, items }) {
  const estado = pedido.estado || ESTADO_INICIAL;

  const text = [
    "Se ha registrado un nuevo pedido.",
    `Cliente: ${cliente.nombre || "Sin nombre"}`,
    `Correo: ${cliente.email}`,
    `Pedido: #${pedido.id}`,
    `Estado: ${estado}`,
    "",
    ...filasTexto(items),
    `Total: ${dinero(pedido.total)}`,
  ].join("\n");

  const html = envolver(`
    <p>Se ha registrado un <strong>nuevo pedido</strong>.</p>
    <p>Cliente: ${escapar(cliente.nombre || "Sin nombre")} (${escapar(cliente.email)})<br>
       Pedido: <strong>#${escapar(pedido.id)}</strong><br>
       Estado: ${escapar(estado)}</p>
    ${tablaHtml(items, pedido.total)}
  `);

  return {
    subject: `Nuevo pedido #${pedido.id}`,
    text,
    html,
  };
}

module.exports = { plantillaComprobanteCliente, plantillaNuevoPedidoAdmin };
