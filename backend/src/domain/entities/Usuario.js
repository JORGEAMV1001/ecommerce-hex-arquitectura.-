/**
 * Entidad de dominio: Usuario
 * No conoce nada de HTTP, Express ni PostgreSQL (capa pura de dominio).
 */
class Usuario {
  constructor({ id = null, nombre, email, passwordHash, rol = 'cliente', creadoEn = new Date() }) {
    if (!nombre || nombre.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }
    if (!Usuario.emailValido(email)) {
      throw new Error('El email proporcionado no es válido');
    }
    if (!['cliente', 'administrador'].includes(rol)) {
      throw new Error('Rol inválido, use "cliente" o "administrador"');
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.email = email.trim().toLowerCase();
    this.passwordHash = passwordHash; // nunca se guarda texto plano
    this.rol = rol;
    this.creadoEn = creadoEn;
  }

  static emailValido(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Regla de negocio: política mínima de seguridad de contraseñas.
   * Se valida ANTES de hashear, en el caso de uso (la entidad nunca ve
   * la contraseña en texto plano una vez construida).
   */
  static validarPoliticaPassword(passwordPlano) {
    const errores = [];
    if (!passwordPlano || passwordPlano.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(passwordPlano || '')) {
      errores.push('La contraseña debe incluir al menos una mayúscula');
    }
    if (!/[0-9]/.test(passwordPlano || '')) {
      errores.push('La contraseña debe incluir al menos un número');
    }
    if (errores.length > 0) {
      throw new Error(errores.join('. '));
    }
    return true;
  }

  esAdministrador() {
    return this.rol === 'administrador';
  }

  /** Representación segura: jamás expone el hash de la contraseña */
  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      creadoEn: this.creadoEn,
    };
  }
}

module.exports = Usuario;
