/**
 * Puerto de salida: contrato del módulo de cifrado de contraseñas.
 * El caso de uso depende de esta interfaz, no de bcrypt directamente,
 * permitiendo cambiar el algoritmo de hashing sin tocar la lógica de negocio.
 */
class IPasswordHasher {
  async hash(passwordPlano) { throw new Error('No implementado'); }
  async comparar(passwordPlano, hash) { throw new Error('No implementado'); }
}

module.exports = IPasswordHasher;
