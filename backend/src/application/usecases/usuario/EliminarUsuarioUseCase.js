class EliminarUsuarioUseCase {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar(id) {
    const existente = await this.usuarioRepository.buscarPorId(id);
    if (!existente) throw new Error("Usuario no encontrado");
    await this.usuarioRepository.eliminar(id);
    return { mensaje: "Usuario eliminado correctamente" };
  }
}

module.exports = EliminarUsuarioUseCase;
