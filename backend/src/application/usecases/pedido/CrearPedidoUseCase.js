const Pedido = require("../../../domain/entities/Pedido");

/**
 * Caso de uso: Crear pedido.
 * Regla de negocio clave: comprueba stock disponible de cada producto
 * ANTES de confirmar la venta, y calcula el monto total en el dominio.
 */
class CrearPedidoUseCase {
  constructor({
    pedidoRepository,
    productoRepository,
    usuarioRepository,
    emailService,
  }) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
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

    await this.emailService.enviarComprobanteCompra({
      cliente: usuario,
      pedido: pedidoCreado,
      instruccionesPago:
        "Realiza tu pago siguiendo las instrucciones proporcionadas por la tienda.",
    });

    return pedidoCreado.toPublicJSON();
  }
}

module.exports = CrearPedidoUseCase;
