
class EmailServicePort {
  async enviarComprobanteCompra({ cliente, pedido, instruccionesPago }) {
    throw new Error("Metodo enviarComprobanteCompra no implementado");
  }

  async notificarNuevoPedido({ administradorEmail, cliente, pedido }) {
    throw new Error("Metodo notificarNuevoPedido no implementado");
  }
}

module.exports = EmailServicePort;
