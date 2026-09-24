/**
 * Puerto de salida: contrato de persistencia para Producto.
 */
class IProductoRepository {
  async crear(producto) { throw new Error('No implementado'); }
  async buscarPorId(id) { throw new Error('No implementado'); }
  async listar() { throw new Error('No implementado'); }
  async actualizar(id, datos) { throw new Error('No implementado'); }
  async eliminar(id) { throw new Error('No implementado'); }
  async descontarStock(id, cantidad) { throw new Error('No implementado'); }
}

module.exports = IProductoRepository;
