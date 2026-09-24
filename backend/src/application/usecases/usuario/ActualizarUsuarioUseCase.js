const Usuario = require("../../../domain/entities/Usuario");

class ActualizarUsuarioUseCase {
  constructor({ usuarioRepository, passwordHasher }) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async ejecutar(id, { nombre, email, password, rol }) {
    const existente = await this.usuarioRepository.buscarPorId(id);
    if (!existente) throw new Error("Usuario no encontrado");

    const datosActualizados = {
      nombre: nombre ?? existente.nombre,
      email: email ?? existente.email,
      rol: rol ?? existente.rol,
    };

    if (password) {
      Usuario.validarPoliticaPassword(password);
      datosActualizados.passwordHash = await this.passwordHasher.hash(password);
    }

    const usuarioValidado = new Usuario({
      ...existente,
      ...datosActualizados,
      passwordHash: datosActualizados.passwordHash ?? existente.passwordHash,
    });

    const actualizado = await this.usuarioRepository.actualizar(id, usuarioValidado);
    return actualizado.toPublicJSON();
  }
}

module.exports = ActualizarUsuarioUseCase;
