const jwt = require('jsonwebtoken');

/**
 * Controlador REST de Usuario (adaptador de entrada).
 * Traduce peticiones HTTP a llamadas de casos de uso; no contiene lógica de negocio.
 */
class UsuarioController {
  constructor({
    registrarUsuarioUseCase,
    autenticarUsuarioUseCase,
    obtenerUsuarioUseCase,
    listarUsuariosUseCase,
    actualizarUsuarioUseCase,
    eliminarUsuarioUseCase,
    crearUsuarioComoAdminUseCase,
    actualizarPrivilegiosUsuarioUseCase,
  }) {
    this.registrarUsuarioUseCase = registrarUsuarioUseCase;
    this.autenticarUsuarioUseCase = autenticarUsuarioUseCase;
    this.obtenerUsuarioUseCase = obtenerUsuarioUseCase;
    this.listarUsuariosUseCase = listarUsuariosUseCase;
    this.actualizarUsuarioUseCase = actualizarUsuarioUseCase;
    this.eliminarUsuarioUseCase = eliminarUsuarioUseCase;
    this.crearUsuarioComoAdminUseCase = crearUsuarioComoAdminUseCase;
    this.actualizarPrivilegiosUsuarioUseCase = actualizarPrivilegiosUsuarioUseCase;

    // bind para usarlos directamente como route handlers
    this.registrar = this.registrar.bind(this);
    this.login = this.login.bind(this);
    this.obtener = this.obtener.bind(this);
    this.listar = this.listar.bind(this);
    this.actualizar = this.actualizar.bind(this);
    this.eliminar = this.eliminar.bind(this);
    this.crearComoAdmin = this.crearComoAdmin.bind(this);
    this.actualizarPrivilegios = this.actualizarPrivilegios.bind(this);
  }

  async registrar(req, res, next) {
    try {
      const usuario = await this.registrarUsuarioUseCase.ejecutar(req.body);
      res.status(201).json(usuario);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const usuario = await this.autenticarUsuarioUseCase.ejecutar(req.body);
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol, permisos: usuario.permisos },
        process.env.JWT_SECRET || 'cambia_este_secreto',
        { expiresIn: '2h' }
      );
      res.json({ usuario, token });
    } catch (err) {
      next(err);
    }
  }

  async obtener(req, res, next) {
    try {
      const usuario = await this.obtenerUsuarioUseCase.ejecutar(req.params.id);
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  }

  async listar(req, res, next) {
    try {
      const usuarios = await this.listarUsuariosUseCase.ejecutar();
      res.json(usuarios);
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req, res, next) {
    try {
      const usuario = await this.actualizarUsuarioUseCase.ejecutar(req.params.id, req.body);
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req, res, next) {
    try {
      const resultado = await this.eliminarUsuarioUseCase.ejecutar(req.params.id);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }

  /** Alta directa de un usuario por parte de un administrador (queda aprobado de inmediato) */
  async crearComoAdmin(req, res, next) {
    try {
      const usuario = await this.crearUsuarioComoAdminUseCase.ejecutar(req.body);
      res.status(201).json(usuario);
    } catch (err) {
      next(err);
    }
  }

  /** Aprobar/rechazar un registro y/o editar los permisos de módulo de un usuario */
  async actualizarPrivilegios(req, res, next) {
    try {
      const usuario = await this.actualizarPrivilegiosUsuarioUseCase.ejecutar(req.params.id, req.body);
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UsuarioController;