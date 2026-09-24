class EliminarPedidoUseCase {
  constructor({ pedidoRepository }) {
    this.pedidoRepository = pedidoRepository;
  }

  async ejecutar(id) {
    const existente = await this.pedidoRepository.buscarPorId(id);
    if (!existente) throw new Error("Pedido no encontrado");
    await this.pedidoRepository.eliminar(id);
    return { mensaje: "Pedido eliminado correctamente" };
  }
}

module.exports = EliminarPedidoUseCase;
