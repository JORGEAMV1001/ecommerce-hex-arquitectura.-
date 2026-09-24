class EliminarProductoUseCase {
  constructor({ productoRepository }) {
    this.productoRepository = productoRepository;
  }

  async ejecutar(id) {
    const existente = await this.productoRepository.buscarPorId(id);
    if (!existente) throw new Error("Producto no encontrado");
    await this.productoRepository.eliminar(id);
    return { mensaje: "Producto eliminado correctamente" };
  }
}

module.exports = EliminarProductoUseCase;
