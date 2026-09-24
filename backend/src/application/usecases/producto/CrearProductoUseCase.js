const Producto = require("../../../domain/entities/Producto");

class CrearProductoUseCase {
  constructor({ productoRepository }) {
    this.productoRepository = productoRepository;
  }

  async ejecutar({ nombre, descripcion, precio, stock }) {
    const producto = new Producto({ nombre, descripcion, precio, stock });
    const creado = await this.productoRepository.crear(producto);
    return creado.toPublicJSON();
  }
}

module.exports = CrearProductoUseCase;
