const { Router } = require("express");
const { requiereAutenticacion, requiereAdministrador } = require("../middlewares/authMiddleware");

function crearUsuarioRoutes(usuarioController) {
  const router = Router();

  router.post("/registro", usuarioController.registrar);
  router.post("/login", usuarioController.login);
  router.get("/", requiereAutenticacion, requiereAdministrador, usuarioController.listar);
  router.get("/:id", requiereAutenticacion, usuarioController.obtener);
  router.put("/:id", requiereAutenticacion, usuarioController.actualizar);
  router.delete("/:id", requiereAutenticacion, requiereAdministrador, usuarioController.eliminar);

  return router;
}

module.exports = crearUsuarioRoutes;
