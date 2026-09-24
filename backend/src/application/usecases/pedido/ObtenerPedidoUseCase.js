class ObtenerPedidoUseCase {
  constructor({ pedidoRepository }) {
    this.pedidoRepository = pedidoRepository;
  }

  async ejecutar(id) {
    const pedido = await this.pedidoRepository.buscarPorId(id);
    if (!pedido) throw new Error("Pedido no encontrado");
    return pedido.toPublicJSON();
  }
}

module.exports = ObtenerPedidoUseCase;
