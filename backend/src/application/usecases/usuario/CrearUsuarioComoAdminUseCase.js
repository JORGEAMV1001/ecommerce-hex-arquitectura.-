const Usuario = require("../../../domain/entities/Usuario");

/**
 * Caso de uso: un administrador da de alta un usuario directamente.
 * A diferencia del autorregistro público, aquí el propio administrador
 * decide el rol, y la cuenta queda "aprobada" desde su creación, con
 * los permisos de módulo que el administrador le asigne.
 */
class CrearUsuarioComoAdminUseCase {
  constructor({ usuarioRepository, passwordHasher }) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async ejecutar({ nombre, email, password, rol = "cliente", permisos = [] }) {
    const existente = await this.usuarioRepository.buscarPorEmail(email?.trim().toLowerCase());
    if (existente) {
      throw new Error("Ya existe un usuario registrado con ese email");
    }

    Usuario.validarPoliticaPassword(password);
    const passwordHash = await this.passwordHasher.hash(password);

    const usuario = new Usuario({ nombre, email, passwordHash, rol, estado: "aprobado", permisos });
    const usuarioCreado = await this.usuarioRepository.crear(usuario);
    return usuarioCreado.toPublicJSON();
  }
}

module.exports = CrearUsuarioComoAdminUseCase;