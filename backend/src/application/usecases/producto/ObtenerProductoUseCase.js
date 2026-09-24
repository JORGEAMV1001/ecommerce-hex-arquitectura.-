class ObtenerProductoUseCase {
  constructor({ productoRepository }) {
    this.productoRepository = productoRepository;
  }

  async ejecutar(id) {
    const producto = await this.productoRepository.buscarPorId(id);
    if (!producto) throw new Error("Producto no encontrado");
    return producto.toPublicJSON();
  }
}

module.exports = ObtenerProductoUseCase;
