/**
 * Puerto de salida (output port).
 * Contrato que debe cumplir cualquier adaptador de persistencia de Usuario
 * (ej. infrastructure/adapters/out/postgres/UsuarioRepository.js).
 * La capa de aplicación depende de esta interfaz, nunca de PostgreSQL directamente.
 */
class IUsuarioRepository {
  async crear(usuario) { throw new Error('No implementado'); }
  async buscarPorId(id) { throw new Error('No implementado'); }
  async buscarPorEmail(email) { throw new Error('No implementado'); }
  async listar() { throw new Error('No implementado'); }
  async actualizar(id, datos) { throw new Error('No implementado'); }
  async eliminar(id) { throw new Error('No implementado'); }
}

module.exports = IUsuarioRepository;
