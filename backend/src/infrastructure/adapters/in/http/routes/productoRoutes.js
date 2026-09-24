const { Router } = require("express");
const { requiereAutenticacion, requiereAdministrador } = require("../middlewares/authMiddleware");

function crearProductoRoutes(productoController) {
  const router = Router();

  router.get("/", productoController.listar); // catálogo público
  router.get("/:id", productoController.obtener);
  router.post("/", requiereAutenticacion, requiereAdministrador, productoController.crear);
  router.put("/:id", requiereAutenticacion, requiereAdministrador, productoController.actualizar);
  router.delete("/:id", requiereAutenticacion, requiereAdministrador, productoController.eliminar);

  return router;
}

module.exports = crearProductoRoutes;
