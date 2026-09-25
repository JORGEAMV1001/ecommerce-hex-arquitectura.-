const Usuario = require("../../../domain/entities/Usuario");

/**
 * Caso de uso: un administrador aprueba/rechaza el registro de un usuario
 * y/o edita a qué módulos de la aplicación (catálogo, pedidos) tiene acceso.
 * No toca nombre, email ni contraseña: para eso existe ActualizarUsuarioUseCase.
 */
class ActualizarPrivilegiosUsuarioUseCase {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar(id, { estado, permisos, rol }) {
    const existente = await this.usuarioRepository.buscarPorId(id);
    if (!existente) {
      throw new Error("Usuario no encontrado");
    }

    const usuarioValidado = new Usuario({
      ...existente,
      estado: estado ?? existente.estado,
      permisos: permisos ?? existente.permisos,
      rol: rol ?? existente.rol,
    });

    const actualizado = await this.usuarioRepository.actualizarPrivilegios(id, usuarioValidado);
    return actualizado.toPublicJSON();
  }
}

module.exports = ActualizarPrivilegiosUsuarioUseCase;