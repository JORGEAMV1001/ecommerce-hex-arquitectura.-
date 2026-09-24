/**
 * Entidad de dominio: Producto
 */
class Producto {
  constructor({ id = null, nombre, descripcion = '', precio, stock, creadoEn = new Date() }) {
    if (!nombre || nombre.trim().length < 2) {
      throw new Error('El nombre del producto debe tener al menos 2 caracteres');
    }
    if (typeof precio !== 'number' || Number.isNaN(precio) || precio <= 0) {
      throw new Error('El precio debe ser un número mayor a 0');
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('El stock debe ser un entero mayor o igual a 0');
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = descripcion?.trim() || '';
    this.precio = precio;
    this.stock = stock;
    this.creadoEn = creadoEn;
  }

  /** Regla de negocio: comprobación de stock disponible al ordenar */
  tieneStockSuficiente(cantidadSolicitada) {
    if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada <= 0) {
      throw new Error('La cantidad solicitada debe ser un entero positivo');
    }
    return this.stock >= cantidadSolicitada;
  }

  /** Regla de negocio: descuenta stock al confirmarse un pedido */
  descontarStock(cantidad) {
    if (!this.tieneStockSuficiente(cantidad)) {
      throw new Error(`Stock insuficiente para "${this.nombre}" (disponible: ${this.stock}, solicitado: ${cantidad})`);
    }
    this.stock -= cantidad;
    return this.stock;
  }

  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      stock: this.stock,
      creadoEn: this.creadoEn,
    };
  }
}

module.exports = Producto;
