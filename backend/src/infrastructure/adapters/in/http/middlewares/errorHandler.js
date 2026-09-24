/**
 * Middleware de manejo de errores. Traduce errores de dominio/aplicación
 * (Error simples con mensaje) a respuestas HTTP consistentes.
 * Nunca expone stack traces ni detalles internos al cliente en producción.
 */
function errorHandler(err, req, res, next) {
  console.error(err);
  const mensaje = err.message || "Error interno del servidor";

  const mapaEstados = [
    { patron: /no encontrado/i, estado: 404 },
    { patron: /ya existe|inválid|debe|insuficiente|no se puede/i, estado: 400 },
    { patron: /credenciales/i, estado: 401 },
  ];

  const coincidencia = mapaEstados.find((m) => m.patron.test(mensaje));
  const estado = coincidencia ? coincidencia.estado : 500;

  res.status(estado).json({ error: mensaje });
}

module.exports = errorHandler;
