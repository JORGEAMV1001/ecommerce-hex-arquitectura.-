const IProductoRepository = require('../../../../application/ports/out/IProductoRepository');
const Producto = require('../../../../domain/entities/Producto');

function filaAProducto(fila) {
  if (!fila) return null;
  return new Producto({
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precio: Number(fila.precio),
    stock: fila.stock,
    creadoEn: fila.creado_en,
  });
}

class ProductoRepository extends IProductoRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async crear(producto) {
    const sql = `
      INSERT INTO productos (nombre, descripcion, precio, stock)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const { rows } = await this.pool.query(sql, [
      producto.nombre,
      producto.descripcion,
      producto.precio,
      producto.stock,
    ]);
    return filaAProducto(rows[0]);
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    return filaAProducto(rows[0]);
  }

  async listar() {
    const { rows } = await this.pool.query('SELECT * FROM productos ORDER BY id');
    return rows.map(filaAProducto);
  }

  async actualizar(id, producto) {
    const sql = `
      UPDATE productos
      SET nombre = $1, descripcion = $2, precio = $3, stock = $4
      WHERE id = $5
      RETURNING *`;
    const { rows } = await this.pool.query(sql, [
      producto.nombre,
      producto.descripcion,
      producto.precio,
      producto.stock,
      id,
    ]);
    return filaAProducto(rows[0]);
  }

  async eliminar(id) {
    await this.pool.query('DELETE FROM productos WHERE id = $1', [id]);
  }

  /** Descuento atómico de stock a nivel de fila (evita condiciones de carrera) */
  async descontarStock(id, cantidad) {
    const sql = `
      UPDATE productos
      SET stock = stock - $1
      WHERE id = $2 AND stock >= $1
      RETURNING *`;
    const { rows } = await this.pool.query(sql, [cantidad, id]);
    if (rows.length === 0) {
      throw new Error('Stock insuficiente o producto inexistente al momento de confirmar el pedido');
    }
    return filaAProducto(rows[0]);
  }
}

module.exports = ProductoRepository;
