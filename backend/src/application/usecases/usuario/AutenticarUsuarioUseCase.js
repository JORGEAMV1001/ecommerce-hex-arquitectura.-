/**
 * Caso de uso: Autenticar usuario (login) comparando password contra el hash almacenado.
 */
class AutenticarUsuarioUseCase {
  constructor({ usuarioRepository, passwordHasher }) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async ejecutar({ email, password }) {
    const usuario = await this.usuarioRepository.buscarPorEmail(email?.trim().toLowerCase());
    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }
    const coincide = await this.passwordHasher.comparar(password, usuario.passwordHash);
    if (!coincide) {
      throw new Error("Credenciales inválidas");
    }

    if (usuario.estado === "pendiente") {
      throw new Error("Tu cuenta está pendiente de aprobación por un administrador.");
    }
    if (usuario.estado === "rechazado") {
      throw new Error("Tu acceso fue rechazado por un administrador.");
    }

    return usuario.toPublicJSON();
  }
}

module.exports = AutenticarUsuarioUseCase;