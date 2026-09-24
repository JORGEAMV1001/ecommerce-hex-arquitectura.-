const IPedidoRepository = require('../../../../application/ports/out/IPedidoRepository');
const Pedido = require('../../../../domain/entities/Pedido');

function filasAPedido(filaPedido, filasItems) {
  if (!filaPedido) return null;
  return new Pedido({
    id: filaPedido.id,
    usuarioId: filaPedido.usuario_id,
    estado: filaPedido.estado,
    creadoEn: filaPedido.creado_en,
    items: filasItems.map((i) => ({
      productoId: i.producto_id,
      nombreProducto: i.nombre_producto,
      precioUnitario: Number(i.precio_unitario),
      cantidad: i.cantidad,
    })),
  });
}

/**
 * Adaptador de salida: implementa IPedidoRepository contra PostgreSQL.
 * `pedidos` (cabecera) y `pedido_items` (líneas) se escriben en una
 * transacción para mantener la consistencia del registro transaccional.
 */
class PedidoRepository extends IPedidoRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async crear(pedido) {
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');

      const { rows: pedidoRows } = await cliente.query(
        `INSERT INTO pedidos (usuario_id, estado, total) VALUES ($1, $2, $3) RETURNING *`,
        [pedido.usuarioId, pedido.estado, pedido.total]
      );
      const pedidoId = pedidoRows[0].id;

      const itemsInsertados = [];
      for (const item of pedido.items) {
        const { rows } = await cliente.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, precio_unitario, cantidad)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [pedidoId, item.productoId, item.nombreProducto, item.precioUnitario, item.cantidad]
        );
        itemsInsertados.push(rows[0]);
      }

      await cliente.query('COMMIT');
      return filasAPedido(pedidoRows[0], itemsInsertados);
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  async buscarPorId(id) {
    const { rows: pedidoRows } = await this.pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (pedidoRows.length === 0) return null;
    const { rows: itemRows } = await this.pool.query('SELECT * FROM pedido_items WHERE pedido_id = $1', [id]);
    return filasAPedido(pedidoRows[0], itemRows);
  }

  async _hidratarLista(pedidoRows) {
    const resultado = [];
    for (const fila of pedidoRows) {
      const { rows: itemRows } = await this.pool.query('SELECT * FROM pedido_items WHERE pedido_id = $1', [
        fila.id,
      ]);
      resultado.push(filasAPedido(fila, itemRows));
    }
    return resultado;
  }

  async listarPorUsuario(usuarioId) {
    const { rows } = await this.pool.query('SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY id DESC', [
      usuarioId,
    ]);
    return this._hidratarLista(rows);
  }

  async listar() {
    const { rows } = await this.pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    return this._hidratarLista(rows);
  }

  async actualizarEstado(id, estado) {
    const { rows } = await this.pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *', [
      estado,
      id,
    ]);
    const { rows: itemRows } = await this.pool.query('SELECT * FROM pedido_items WHERE pedido_id = $1', [id]);
    return filasAPedido(rows[0], itemRows);
  }

  async eliminar(id) {
    await this.pool.query('DELETE FROM pedidos WHERE id = $1', [id]); // ON DELETE CASCADE limpia pedido_items
  }
}

module.exports = PedidoRepository;
