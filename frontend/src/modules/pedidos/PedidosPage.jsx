import { useEffect, useState } from 'react';
import { listarProductos } from '../productos/productosService';
import { crearPedido, listarPedidos } from './pedidosService';
import { usuarioActual } from '../auth/authService';

// El valor guardado en la base sigue siendo "pendiente";
// aquí solo se traduce al texto que ve el cliente.
const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente de Pago',
  confirmado: 'Pago confirmado',
  cancelado: 'Cancelado',
};

const etiquetaEstado = (estado) => ETIQUETAS_ESTADO[estado] || estado;
const dinero = (n) => `$${Number(n || 0).toFixed(2)}`;

const estilos = {
  resumen: {
    border: '2px solid #1a56db',
    borderRadius: 8,
    padding: 16,
    margin: '16px 0',
    background: '#f3f7ff',
  },
  insignia: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    background: '#fff3cd',
    color: '#7a5b00',
    fontWeight: 600,
    fontSize: 14,
  },
  aviso: {
    margin: '12px 0 0',
    fontSize: 14,
    lineHeight: 1.5,
  },
  botonSecundario: {
    marginTop: 12,
    width: '100%',
  },
};

export default function PedidosPage() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carrito, setCarrito] = useState({}); // { productoId: cantidad }
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const usuario = usuarioActual();

  async function cargar() {
    const [prods, peds] = await Promise.all([listarProductos(), listarPedidos(usuario?.id)]);
    setProductos(prods);
    setPedidos(peds);
  }

  useEffect(() => {
    cargar();
  }, []);

  function actualizarCantidad(productoId, cantidad) {
    setCarrito((c) => ({ ...c, [productoId]: Number(cantidad) }));
  }

  async function manejarPedido(e) {
    e.preventDefault();
    if (enviando) return;
    setError('');

    const items = Object.entries(carrito)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }));

    if (items.length === 0) {
      setError('Selecciona al menos un producto');
      return;
    }

    setEnviando(true);
    try {
      const pedido = await crearPedido({ usuarioId: usuario.id, items });
      setPedidoCreado(pedido);
      setCarrito({});
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el pedido');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {pedidoCreado && (
        <section style={estilos.resumen} aria-live="polite">
          <h2>¡Pedido #{pedidoCreado.id} registrado!</h2>
          <p>
            <span style={estilos.insignia}>{etiquetaEstado(pedidoCreado.estado)}</span>
          </p>

          <ul>
            {pedidoCreado.items.map((item, idx) => (
              <li key={idx}>
                {item.cantidad} × {item.nombreProducto} ({dinero(item.precioUnitario)})
              </li>
            ))}
          </ul>
          <p>
            <strong>Total a pagar: {dinero(pedidoCreado.total)}</strong>
          </p>

          <p style={estilos.aviso}>
            Te enviamos un correo{usuario?.email ? ` a ${usuario.email}` : ''} con el comprobante de
            tu compra y las instrucciones de pago (banco, titular y CLABE). Al realizar tu pago,
            indica el número de pedido <strong>#{pedidoCreado.id}</strong> como concepto.
          </p>

          <button type="button" style={estilos.botonSecundario} onClick={() => setPedidoCreado(null)}>
            Entendido
          </button>
        </section>
      )}

      <h2>Nuevo pedido</h2>
      <form className="tarjeta" onSubmit={manejarPedido}>
        {productos.map((p) => (
          <div className="fila-producto" key={p.id}>
            <span>
              {p.nombre} (${p.precio}) — disponible: {p.stock}
            </span>
            <input
              type="number"
              min="0"
              max={p.stock}
              placeholder="0"
              value={carrito[p.id] || ''}
              onChange={(e) => actualizarCantidad(p.id, e.target.value)}
            />
          </div>
        ))}
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Procesando pedido...' : 'Confirmar pedido'}
        </button>
      </form>

      <h2>Mis pedidos</h2>
      <div className="grilla">
        {pedidos.map((pedido) => (
          <div className="tarjeta" key={pedido.id}>
            <p>
              Pedido #{pedido.id} — <strong>{etiquetaEstado(pedido.estado)}</strong>
            </p>
            <ul>
              {pedido.items.map((item, idx) => (
                <li key={idx}>
                  {item.cantidad} × {item.nombreProducto} (${item.precioUnitario})
                </li>
              ))}
            </ul>
            <p>Total: {dinero(pedido.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}