/**
 * Entidad de dominio: Pedido
 * Vincula un usuario con uno o más productos (líneas de pedido).
 *
 * ItemPedido: { productoId, nombreProducto, precioUnitario, cantidad }
 */
class Pedido {
  constructor({ id = null, usuarioId, items = [], estado = 'pendiente', creadoEn = new Date() }) {
    if (!usuarioId) {
      throw new Error('El pedido debe estar vinculado a un usuario');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('El pedido debe contener al menos un producto');
    }
    items.forEach((item) => Pedido.validarItem(item));
    if (!['pendiente', 'confirmado', 'cancelado'].includes(estado)) {
      throw new Error('Estado de pedido inválido');
    }

    this.id = id;
    this.usuarioId = usuarioId;
    this.items = items;
    this.estado = estado;
    this.creadoEn = creadoEn;
    this.total = Pedido.calcularTotal(items);
  }

  static validarItem(item) {
    if (!item.productoId) throw new Error('Cada item requiere productoId');
    if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      throw new Error('La cantidad de cada item debe ser un entero positivo');
    }
    if (typeof item.precioUnitario !== 'number' || item.precioUnitario <= 0) {
      throw new Error('El precio unitario debe ser un número mayor a 0');
    }
  }

  /** Regla de negocio: cálculo de montos totales */
  static calcularTotal(items) {
    return Number(
      items.reduce((acumulado, item) => acumulado + item.precioUnitario * item.cantidad, 0).toFixed(2)
    );
  }

  confirmar() {
    if (this.estado !== 'pendiente') {
      throw new Error(`No se puede confirmar un pedido en estado "${this.estado}"`);
    }
    this.estado = 'confirmado';
  }

  cancelar() {
    if (this.estado === 'confirmado') {
      throw new Error('No se puede cancelar un pedido ya confirmado');
    }
    this.estado = 'cancelado';
  }

  toPublicJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      items: this.items,
      estado: this.estado,
      total: this.total,
      creadoEn: this.creadoEn,
    };
  }
}

module.exports = Pedido;
