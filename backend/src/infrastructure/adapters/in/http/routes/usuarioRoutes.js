const { Router } = require("express");
const { requiereAutenticacion, requiereAdministrador } = require("../middlewares/authMiddleware");

function crearUsuarioRoutes(usuarioController) {
  const router = Router();

  router.post("/registro", usuarioController.registrar);
  router.post("/login", usuarioController.login);
  router.get("/", requiereAutenticacion, requiereAdministrador, usuarioController.listar);
  router.get("/:id", requiereAutenticacion, usuarioController.obtener);
  // Alta directa de usuarios por un administrador (queda aprobado desde su creación)
  router.post("/", requiereAutenticacion, requiereAdministrador, usuarioController.crearComoAdmin);
  router.put("/:id", requiereAutenticacion, usuarioController.actualizar);
  // Aprobar/rechazar el registro y editar a qué módulos tiene acceso un usuario
  router.patch(
    "/:id/privilegios",
    requiereAutenticacion,
    requiereAdministrador,
    usuarioController.actualizarPrivilegios
  );
  router.delete("/:id", requiereAutenticacion, requiereAdministrador, usuarioController.eliminar);

  return router;
}

module.exports = crearUsuarioRoutes;