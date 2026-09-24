const express = require("express");
const cors = require("cors");
const construirContenedor = require("./container");
const crearUsuarioRoutes = require("../adapters/in/http/routes/usuarioRoutes");
const crearProductoRoutes = require("../adapters/in/http/routes/productoRoutes");
const crearPedidoRoutes = require("../adapters/in/http/routes/pedidoRoutes");
const errorHandler = require("../adapters/in/http/middlewares/errorHandler");

function crearServidor() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const { usuarioController, productoController, pedidoController } = construirContenedor();

  app.get("/health", (req, res) => res.json({ estado: "ok" }));

  app.use("/api/usuarios", crearUsuarioRoutes(usuarioController));
  app.use("/api/productos", crearProductoRoutes(productoController));
  app.use("/api/pedidos", crearPedidoRoutes(pedidoController));

  app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
  app.use(errorHandler); // siempre al final

  return app;
}

module.exports = crearServidor;
