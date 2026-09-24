class ObtenerUsuarioUseCase {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar(id) {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    return usuario.toPublicJSON();
  }
}

module.exports = ObtenerUsuarioUseCase;
