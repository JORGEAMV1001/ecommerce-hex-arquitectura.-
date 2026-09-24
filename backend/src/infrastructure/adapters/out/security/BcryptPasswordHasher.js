const bcrypt = require("bcrypt");
const IPasswordHasher = require("../../../../application/ports/out/IPasswordHasher");

const SALT_ROUNDS = 12;

/**
 * Adaptador de salida: implementa el puerto IPasswordHasher usando bcrypt.
 * Es el único punto del sistema que sabe qué algoritmo de hashing se usa.
 */
class BcryptPasswordHasher extends IPasswordHasher {
  async hash(passwordPlano) {
    return bcrypt.hash(passwordPlano, SALT_ROUNDS);
  }

  async comparar(passwordPlano, hash) {
    return bcrypt.compare(passwordPlano, hash);
  }
}

module.exports = BcryptPasswordHasher;
