class PedidoController {
  constructor({
    crearPedidoUseCase,
    obtenerPedidoUseCase,
    listarPedidosUseCase,
    actualizarEstadoPedidoUseCase,
    eliminarPedidoUseCase,
  }) {
    this.crearPedidoUseCase = crearPedidoUseCase;
    this.obtenerPedidoUseCase = obtenerPedidoUseCase;
    this.listarPedidosUseCase = listarPedidosUseCase;
    this.actualizarEstadoPedidoUseCase = actualizarEstadoPedidoUseCase;
    this.eliminarPedidoUseCase = eliminarPedidoUseCase;

    this.crear = this.crear.bind(this);
    this.obtener = this.obtener.bind(this);
    this.listar = this.listar.bind(this);
    this.actualizarEstado = this.actualizarEstado.bind(this);
    this.eliminar = this.eliminar.bind(this);
  }

  async crear(req, res, next) {
    try {
      const pedido = await this.crearPedidoUseCase.ejecutar(req.body);
      res.status(201).json(pedido);
    } catch (err) { next(err); }
  }

  async obtener(req, res, next) {
    try {
      const pedido = await this.obtenerPedidoUseCase.ejecutar(req.params.id);
      res.json(pedido);
    } catch (err) { next(err); }
  }

  async listar(req, res, next) {
    try {
      const pedidos = await this.listarPedidosUseCase.ejecutar(req.query.usuarioId || null);
      res.json(pedidos);
    } catch (err) { next(err); }
  }

  async actualizarEstado(req, res, next) {
    try {
      const pedido = await this.actualizarEstadoPedidoUseCase.ejecutar(req.params.id, req.body.estado);
      res.json(pedido);
    } catch (err) { next(err); }
  }

  async eliminar(req, res, next) {
    try {
      const resultado = await this.eliminarPedidoUseCase.ejecutar(req.params.id);
      res.json(resultado);
    } catch (err) { next(err); }
  }
}

module.exports = PedidoController;
