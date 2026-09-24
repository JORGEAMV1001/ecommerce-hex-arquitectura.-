class ActualizarEstadoPedidoUseCase {
  constructor({ pedidoRepository }) {
    this.pedidoRepository = pedidoRepository;
  }

  async ejecutar(id, nuevoEstado) {
    const pedido = await this.pedidoRepository.buscarPorId(id);
    if (!pedido) throw new Error("Pedido no encontrado");

    if (nuevoEstado === "confirmado") pedido.confirmar();
    else if (nuevoEstado === "cancelado") pedido.cancelar();
    else throw new Error("Transición de estado inválida");

    const actualizado = await this.pedidoRepository.actualizarEstado(id, pedido.estado);
    return actualizado.toPublicJSON();
  }
}

module.exports = ActualizarEstadoPedidoUseCase;
