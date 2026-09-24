const Producto = require("../../../domain/entities/Producto");

class ActualizarProductoUseCase {
  constructor({ productoRepository }) {
    this.productoRepository = productoRepository;
  }

  async ejecutar(id, { nombre, descripcion, precio, stock }) {
    const existente = await this.productoRepository.buscarPorId(id);
    if (!existente) throw new Error("Producto no encontrado");

    const productoValidado = new Producto({
      ...existente,
      nombre: nombre ?? existente.nombre,
      descripcion: descripcion ?? existente.descripcion,
      precio: precio ?? existente.precio,
      stock: stock ?? existente.stock,
    });

    const actualizado = await this.productoRepository.actualizar(id, productoValidado);
    return actualizado.toPublicJSON();
  }
}

module.exports = ActualizarProductoUseCase;
