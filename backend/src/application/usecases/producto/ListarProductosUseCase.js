class ListarProductosUseCase {
  constructor({ productoRepository }) {
    this.productoRepository = productoRepository;
  }

  async ejecutar() {
    const productos = await this.productoRepository.listar();
    return productos.map((p) => p.toPublicJSON());
  }
}

module.exports = ListarProductosUseCase;
