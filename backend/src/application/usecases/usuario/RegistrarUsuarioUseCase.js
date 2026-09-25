const Usuario = require("../../../domain/entities/Usuario");

/**
 * Caso de uso: Registrar (crear) un usuario nuevo.
 * Orquesta la regla de negocio de dominio (política de password) y
 * delega el hashing y la persistencia a los adaptadores de salida (puertos).
 */
class RegistrarUsuarioUseCase {
  constructor({ usuarioRepository, passwordHasher }) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async ejecutar({ nombre, email, password }) {
    const existente = await this.usuarioRepository.buscarPorEmail(email?.trim().toLowerCase());
    if (existente) {
      throw new Error("Ya existe un usuario registrado con ese email");
    }

    Usuario.validarPoliticaPassword(password);
    const passwordHash = await this.passwordHasher.hash(password);

    // El autorregistro público SIEMPRE crea la cuenta como cliente, pendiente
    // de aprobación y sin ningún permiso: rol, estado y permisos los asigna
    // después un administrador. Ignoramos deliberadamente cualquier rol,
    // estado o permisos que llegaran en la petición.
    const usuario = new Usuario({ nombre, email, passwordHash, rol: "cliente", estado: "pendiente", permisos: [] });
    const usuarioCreado = await this.usuarioRepository.crear(usuario);
    return usuarioCreado.toPublicJSON();
  }
}

module.exports = RegistrarUsuarioUseCase;