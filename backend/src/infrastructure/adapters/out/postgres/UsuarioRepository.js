const IUsuarioRepository = require('../../../../application/ports/out/IUsuarioRepository');
const Usuario = require('../../../../domain/entities/Usuario');

function filaAUsuario(fila) {
  if (!fila) return null;
  return new Usuario({
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    passwordHash: fila.password_hash,
    rol: fila.rol,
    creadoEn: fila.creado_en,
  });
}

/**
 * Adaptador de salida: implementa IUsuarioRepository contra PostgreSQL.
 * Traduce entre filas de la tabla `usuarios` y la entidad de dominio Usuario.
 */
class UsuarioRepository extends IUsuarioRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async crear(usuario) {
    const sql = `
      INSERT INTO usuarios (nombre, email, password_hash, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const { rows } = await this.pool.query(sql, [usuario.nombre, usuario.email, usuario.passwordHash, usuario.rol]);
    return filaAUsuario(rows[0]);
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return filaAUsuario(rows[0]);
  }

  async buscarPorEmail(email) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return filaAUsuario(rows[0]);
  }

  async listar() {
    const { rows } = await this.pool.query('SELECT * FROM usuarios ORDER BY id');
    return rows.map(filaAUsuario);
  }

  async actualizar(id, usuario) {
    const sql = `
      UPDATE usuarios
      SET nombre = $1, email = $2, password_hash = $3, rol = $4
      WHERE id = $5
      RETURNING *`;
    const { rows } = await this.pool.query(sql, [
      usuario.nombre,
      usuario.email,
      usuario.passwordHash,
      usuario.rol,
      id,
    ]);
    return filaAUsuario(rows[0]);
  }

  async eliminar(id) {
    await this.pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  }
}

module.exports = UsuarioRepository;
