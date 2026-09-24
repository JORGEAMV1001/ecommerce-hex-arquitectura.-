const pool = require('./db');

// Adaptadores de salida
const UsuarioRepository = require('../adapters/out/postgres/UsuarioRepository');
const ProductoRepository = require('../adapters/out/postgres/ProductoRepository');
const PedidoRepository = require('../adapters/out/postgres/PedidoRepository');
const BcryptPasswordHasher = require('../adapters/out/security/BcryptPasswordHasher');

// Casos de uso - Usuario
const RegistrarUsuarioUseCase = require('../../application/usecases/usuario/RegistrarUsuarioUseCase');
const AutenticarUsuarioUseCase = require('../../application/usecases/usuario/AutenticarUsuarioUseCase');
const ObtenerUsuarioUseCase = require('../../application/usecases/usuario/ObtenerUsuarioUseCase');
const ListarUsuariosUseCase = require('../../application/usecases/usuario/ListarUsuariosUseCase');
const ActualizarUsuarioUseCase = require('../../application/usecases/usuario/ActualizarUsuarioUseCase');
const EliminarUsuarioUseCase = require('../../application/usecases/usuario/EliminarUsuarioUseCase');

// Casos de uso - Producto
const CrearProductoUseCase = require('../../application/usecases/producto/CrearProductoUseCase');
const ObtenerProductoUseCase = require('../../application/usecases/producto/ObtenerProductoUseCase');
const ListarProductosUseCase = require('../../application/usecases/producto/ListarProductosUseCase');
const ActualizarProductoUseCase = require('../../application/usecases/producto/ActualizarProductoUseCase');
const EliminarProductoUseCase = require('../../application/usecases/producto/EliminarProductoUseCase');

// Casos de uso - Pedido
const CrearPedidoUseCase = require('../../application/usecases/pedido/CrearPedidoUseCase');
const ObtenerPedidoUseCase = require('../../application/usecases/pedido/ObtenerPedidoUseCase');
const ListarPedidosUseCase = require('../../application/usecases/pedido/ListarPedidosUseCase');
const ActualizarEstadoPedidoUseCase = require('../../application/usecases/pedido/ActualizarEstadoPedidoUseCase');
const EliminarPedidoUseCase = require('../../application/usecases/pedido/EliminarPedidoUseCase');

// Controladores (adaptadores de entrada)
const UsuarioController = require('../adapters/in/http/controllers/UsuarioController');
const ProductoController = require('../adapters/in/http/controllers/ProductoController');
const PedidoController = require('../adapters/in/http/controllers/PedidoController');

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

  const usuarioController = new UsuarioController({
    registrarUsuarioUseCase: new RegistrarUsuarioUseCase({ usuarioRepository, passwordHasher }),
    autenticarUsuarioUseCase: new AutenticarUsuarioUseCase({ usuarioRepository, passwordHasher }),
    obtenerUsuarioUseCase: new ObtenerUsuarioUseCase({ usuarioRepository }),
    listarUsuariosUseCase: new ListarUsuariosUseCase({ usuarioRepository }),
    actualizarUsuarioUseCase: new ActualizarUsuarioUseCase({ usuarioRepository, passwordHasher }),
    eliminarUsuarioUseCase: new EliminarUsuarioUseCase({ usuarioRepository }),
  });

  const productoController = new ProductoController({
    crearProductoUseCase: new CrearProductoUseCase({ productoRepository }),
    obtenerProductoUseCase: new ObtenerProductoUseCase({ productoRepository }),
    listarProductosUseCase: new ListarProductosUseCase({ productoRepository }),
    actualizarProductoUseCase: new ActualizarProductoUseCase({ productoRepository }),
    eliminarProductoUseCase: new EliminarProductoUseCase({ productoRepository }),
  });

  const pedidoController = new PedidoController({
    crearPedidoUseCase: new CrearPedidoUseCase({ pedidoRepository, productoRepository, usuarioRepository }),
    obtenerPedidoUseCase: new ObtenerPedidoUseCase({ pedidoRepository }),
    listarPedidosUseCase: new ListarPedidosUseCase({ pedidoRepository }),
    actualizarEstadoPedidoUseCase: new ActualizarEstadoPedidoUseCase({ pedidoRepository }),
    eliminarPedidoUseCase: new EliminarPedidoUseCase({ pedidoRepository }),
  });

  return { usuarioController, productoController, pedidoController };
}

module.exports = construirContenedor;
