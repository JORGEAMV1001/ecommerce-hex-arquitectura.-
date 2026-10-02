const Pedido = require("../../../domain/entities/Pedido");

/**
 * Caso de uso: Crear pedido.
 * Regla de negocio clave: comprueba stock disponible de cada producto
 * ANTES de confirmar la venta, y calcula el monto total en el dominio.
 * Tras guardar, notifica por correo a través del puerto EmailServicePort
 * (sin conocer Nodemailer ni el proveedor de correo).
 */
class CrearPedidoUseCase {
  constructor({
    pedidoRepository,
    productoRepository,
    usuarioRepository,
    emailService,
    administradorEmail,
    instruccionesPago,
  }) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
    this.emailService = emailService;
    this.administradorEmail = administradorEmail;
    this.instruccionesPago =
      instruccionesPago ||
      "Realiza tu pago siguiendo las instrucciones proporcionadas por la tienda.";
  }

  async ejecutar({ usuarioId, items }) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    const itemsConPrecio = [];
    for (const item of items) {
      const producto = await this.productoRepository.buscarPorId(
        item.productoId,
      );
      if (!producto)
        throw new Error(`Producto ${item.productoId} no encontrado`);
      if (!producto.tieneStockSuficiente(item.cantidad)) {
        throw new Error(
          `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`,
        );
      }
      itemsConPrecio.push({
        productoId: producto.id,
        nombreProducto: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: item.cantidad,
      });
    }

    // Entidad de dominio valida items y calcula el total automáticamente
    const pedido = new Pedido({ usuarioId, items: itemsConPrecio });

    // Descuenta stock de cada producto (idealmente en una transacción DB, ver repositorio)
    for (const item of itemsConPrecio) {
      await this.productoRepository.descontarStock(
        item.productoId,
        item.cantidad,
      );
    }

    const pedidoCreado = await this.pedidoRepository.crear(pedido);

    await this.#notificar({ usuario, pedidoCreado, items: itemsConPrecio });

    return pedidoCreado.toPublicJSON();
  }

    /**
   * Un fallo en el correo NO debe deshacer ni romper un pedido ya guardado.
   */
  async #notificar({ usuario, pedidoCreado, items }) {
    console.log(`[correo] Pedido #${pedidoCreado.id} creado, enviando notificaciones...`);

    if (!this.emailService) {
      console.log("[correo] No hay emailService configurado, no se envía nada");
      return;
    }

    try {
      const r = await this.emailService.enviarComprobanteCompra({
        cliente: usuario,
        pedido: pedidoCreado,
        items,
        instruccionesPago: this.instruccionesPago,
      });
      console.log(`[correo] Comprobante enviado a ${usuario.email} (id: ${r?.messageId})`);
    } catch (error) {
      console.error("No se pudo enviar el comprobante al cliente:", error.message);
    }

    if (!this.administradorEmail) {
      console.log("[correo] ADMIN_EMAIL no está definido, no se avisa al administrador");
      return;
    }

    try {
      const r = await this.emailService.notificarNuevoPedido({
        administradorEmail: this.administradorEmail,
        cliente: usuario,
        pedido: pedidoCreado,
        items,
      });
      console.log(`[correo] Aviso enviado a ${this.administradorEmail} (id: ${r?.messageId})`);
    } catch (error) {
      console.error("No se pudo notificar al administrador:", error.message);
    }

    if (!this.administradorEmail) return;

    try {
      await this.emailService.notificarNuevoPedido({
        administradorEmail: this.administradorEmail,
        cliente: usuario,
        pedido: pedidoCreado,
        items,
      });
    } catch (error) {
      console.error("No se pudo notificar al administrador:", error.message);
    }
  }
}

module.exports = CrearPedidoUseCase;