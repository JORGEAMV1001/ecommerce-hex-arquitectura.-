class ProductoController {
  constructor({
    crearProductoUseCase,
    obtenerProductoUseCase,
    listarProductosUseCase,
    actualizarProductoUseCase,
    eliminarProductoUseCase,
  }) {
    this.crearProductoUseCase = crearProductoUseCase;
    this.obtenerProductoUseCase = obtenerProductoUseCase;
    this.listarProductosUseCase = listarProductosUseCase;
    this.actualizarProductoUseCase = actualizarProductoUseCase;
    this.eliminarProductoUseCase = eliminarProductoUseCase;

    this.crear = this.crear.bind(this);
    this.obtener = this.obtener.bind(this);
    this.listar = this.listar.bind(this);
    this.actualizar = this.actualizar.bind(this);
    this.eliminar = this.eliminar.bind(this);
  }

  async crear(req, res, next) {
    try {
      const producto = await this.crearProductoUseCase.ejecutar(req.body);
      res.status(201).json(producto);
    } catch (err) { next(err); }
  }

  async obtener(req, res, next) {
    try {
      const producto = await this.obtenerProductoUseCase.ejecutar(req.params.id);
      res.json(producto);
    } catch (err) { next(err); }
  }

  async listar(req, res, next) {
    try {
      const productos = await this.listarProductosUseCase.ejecutar();
      res.json(productos);
    } catch (err) { next(err); }
  }

  async actualizar(req, res, next) {
    try {
      const producto = await this.actualizarProductoUseCase.ejecutar(req.params.id, req.body);
      res.json(producto);
    } catch (err) { next(err); }
  }

  async eliminar(req, res, next) {
    try {
      const resultado = await this.eliminarProductoUseCase.ejecutar(req.params.id);
      res.json(resultado);
    } catch (err) { next(err); }
  }
}

module.exports = ProductoController;
