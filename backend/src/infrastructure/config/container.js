const pool = require("./db");

// Adaptadores de salida
const UsuarioRepository = require("../adapters/out/postgres/UsuarioRepository");
const ProductoRepository = require("../adapters/out/postgres/ProductoRepository");
const PedidoRepository = require("../adapters/out/postgres/PedidoRepository");
const BcryptPasswordHasher = require("../adapters/out/security/BcryptPasswordHasher");
const NodemailAdapter = require("../adapters/out/email/NodemailAdapter");

// Casos de uso - Usuario
const RegistrarUsuarioUseCase = require("../../application/usecases/usuario/RegistrarUsuarioUseCase");
const AutenticarUsuarioUseCase = require("../../application/usecases/usuario/AutenticarUsuarioUseCase");
const ObtenerUsuarioUseCase = require("../../application/usecases/usuario/ObtenerUsuarioUseCase");
const ListarUsuariosUseCase = require("../../application/usecases/usuario/ListarUsuariosUseCase");
const ActualizarUsuarioUseCase = require("../../application/usecases/usuario/ActualizarUsuarioUseCase");
const EliminarUsuarioUseCase = require("../../application/usecases/usuario/EliminarUsuarioUseCase");
const CrearUsuarioComoAdminUseCase = require("../../application/usecases/usuario/CrearUsuarioComoAdminUseCase");
const ActualizarPrivilegiosUsuarioUseCase = require("../../application/usecases/usuario/ActualizarPrivilegiosUsuarioUseCase");

// Casos de uso - Producto
const CrearProductoUseCase = require("../../application/usecases/producto/CrearProductoUseCase");
const ObtenerProductoUseCase = require("../../application/usecases/producto/ObtenerProductoUseCase");
const ListarProductosUseCase = require("../../application/usecases/producto/ListarProductosUseCase");
const ActualizarProductoUseCase = require("../../application/usecases/producto/ActualizarProductoUseCase");
const EliminarProductoUseCase = require("../../application/usecases/producto/EliminarProductoUseCase");

// Casos de uso - Pedido
const CrearPedidoUseCase = require("../../application/usecases/pedido/CrearPedidoUseCase");
const ObtenerPedidoUseCase = require("../../application/usecases/pedido/ObtenerPedidoUseCase");
const ListarPedidosUseCase = require("../../application/usecases/pedido/ListarPedidosUseCase");
const ActualizarEstadoPedidoUseCase = require("../../application/usecases/pedido/ActualizarEstadoPedidoUseCase");
const EliminarPedidoUseCase = require("../../application/usecases/pedido/EliminarPedidoUseCase");

// Controladores (adaptadores de entrada)
const UsuarioController = require("../adapters/in/http/controllers/UsuarioController");
const ProductoController = require("../adapters/in/http/controllers/ProductoController");
const PedidoController = require("../adapters/in/http/controllers/PedidoController");

/**
 * Composition root: es el ÚNICO lugar donde se conectan entre sí
 * dominio, aplicación (casos de uso) e infraestructura (adaptadores).
 * Nada en domain/ ni application/ conoce esta clase.
 */
function construirContenedor() {
  const usuarioRepository = new UsuarioRepository(pool);
  const productoRepository = new ProductoRepository(pool);
  const pedidoRepository = new PedidoRepository(pool);
  const passwordHasher = new BcryptPasswordHasher();
  const emailService = NodemailAdapter.desdeEntorno();

  // Datos de pago que se incluyen en el correo del cliente.
  // Se configuran por variables de entorno; el dominio no los conoce.
  const instruccionesPago = [
    "Realiza una transferencia o depósito con los siguientes datos:",
    `Banco: ${process.env.BANCO_NOMBRE || "Por definir"}`,
    `Titular: ${process.env.BANCO_TITULAR || "Por definir"}`,
    `CLABE: ${process.env.BANCO_CLABE || "Por definir"}`,
    `Plazo para pagar: ${process.env.PLAZO_PAGO_HORAS || 48} horas.`,
    "Envía tu comprobante de pago indicando tu número de pedido.",
  ].join("\n");

  const usuarioController = new UsuarioController({
    registrarUsuarioUseCase: new RegistrarUsuarioUseCase({
      usuarioRepository,
      passwordHasher,
    }),
    autenticarUsuarioUseCase: new AutenticarUsuarioUseCase({
      usuarioRepository,
      passwordHasher,
    }),
    obtenerUsuarioUseCase: new ObtenerUsuarioUseCase({ usuarioRepository }),
    listarUsuariosUseCase: new ListarUsuariosUseCase({ usuarioRepository }),
    actualizarUsuarioUseCase: new ActualizarUsuarioUseCase({
      usuarioRepository,
      passwordHasher,
    }),
    eliminarUsuarioUseCase: new EliminarUsuarioUseCase({ usuarioRepository }),
    crearUsuarioComoAdminUseCase: new CrearUsuarioComoAdminUseCase({
      usuarioRepository,
      passwordHasher,
    }),
    actualizarPrivilegiosUsuarioUseCase:
      new ActualizarPrivilegiosUsuarioUseCase({ usuarioRepository }),
  });

  const productoController = new ProductoController({
    crearProductoUseCase: new CrearProductoUseCase({ productoRepository }),
    obtenerProductoUseCase: new ObtenerProductoUseCase({ productoRepository }),
    listarProductosUseCase: new ListarProductosUseCase({ productoRepository }),
    actualizarProductoUseCase: new ActualizarProductoUseCase({
      productoRepository,
    }),
    eliminarProductoUseCase: new EliminarProductoUseCase({
      productoRepository,
    }),
  });

  const pedidoController = new PedidoController({
    crearPedidoUseCase: new CrearPedidoUseCase({
      pedidoRepository,
      productoRepository,
      usuarioRepository,
      emailService,
      administradorEmail: process.env.ADMIN_EMAIL,
      instruccionesPago,
    }),
    obtenerPedidoUseCase: new ObtenerPedidoUseCase({ pedidoRepository }),
    listarPedidosUseCase: new ListarPedidosUseCase({ pedidoRepository }),
    actualizarEstadoPedidoUseCase: new ActualizarEstadoPedidoUseCase({
      pedidoRepository,
    }),
    eliminarPedidoUseCase: new EliminarPedidoUseCase({ pedidoRepository }),
  });

  return { usuarioController, productoController, pedidoController };
}

module.exports = construirContenedor;
