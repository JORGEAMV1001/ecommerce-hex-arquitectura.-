class ListarPedidosUseCase {
  constructor({ pedidoRepository }) {
    this.pedidoRepository = pedidoRepository;
  }

  async ejecutar(usuarioId = null) {
    const pedidos = usuarioId
      ? await this.pedidoRepository.listarPorUsuario(usuarioId)
      : await this.pedidoRepository.listar();
    return pedidos.map((p) => p.toPublicJSON());
  }
}

module.exports = ListarPedidosUseCase;
