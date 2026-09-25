const { Router } = require("express");
const { requiereAutenticacion, requierePermiso } = require("../middlewares/authMiddleware");

function crearPedidoRoutes(pedidoController) {
  const router = Router();

  router.use(requiereAutenticacion); // todo lo de pedidos exige sesión
  router.use(requierePermiso("pedidos")); // y además el permiso de módulo asignado por un administrador

  router.post("/", pedidoController.crear);
  router.get("/", pedidoController.listar);
  router.get("/:id", pedidoController.obtener);
  router.patch("/:id/estado", pedidoController.actualizarEstado);
  router.delete("/:id", pedidoController.eliminar);

  return router;
}

module.exports = crearPedidoRoutes;