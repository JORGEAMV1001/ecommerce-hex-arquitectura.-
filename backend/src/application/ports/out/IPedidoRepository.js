/**
 * Puerto de salida: contrato de persistencia para Pedido.
 */
class IPedidoRepository {
  async crear(pedido) { throw new Error('No implementado'); }
  async buscarPorId(id) { throw new Error('No implementado'); }
  async listarPorUsuario(usuarioId) { throw new Error('No implementado'); }
  async listar() { throw new Error('No implementado'); }
  async actualizarEstado(id, estado) { throw new Error('No implementado'); }
  async eliminar(id) { throw new Error('No implementado'); }
}

module.exports = IPedidoRepository;
