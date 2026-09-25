const jwt = require("jsonwebtoken");

/**
 * Middleware de autenticación: valida el JWT emitido en el login
 * y adjunta el usuario decodificado a req.usuario.
 */
function requiereAutenticacion(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "cambia_este_secreto");
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/** Middleware de autorización: solo administradores */
function requiereAdministrador(req, res, next) {
  if (req.usuario?.rol !== "administrador") {
    return res.status(403).json({ error: "Requiere rol de administrador" });
  }
  next();
}

/**
 * Middleware de autorización por módulo: exige que el usuario autenticado
 * tenga el permiso indicado (o sea administrador, que siempre tiene acceso total).
 * Los permisos viajan dentro del propio JWT (ver UsuarioController.login).
 */
function requierePermiso(modulo) {
  return (req, res, next) => {
    if (req.usuario?.rol === "administrador") return next();
    const permisos = req.usuario?.permisos || [];
    if (!permisos.includes(modulo)) {
      return res.status(403).json({ error: `No tienes permiso para acceder al módulo de ${modulo}` });
    }
    next();
  };
}

module.exports = { requiereAutenticacion, requiereAdministrador, requierePermiso };