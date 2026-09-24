import { useEffect, useState } from 'react';
import { listarProductos } from '../productos/productosService';
import { crearPedido, listarPedidos } from './pedidosService';
import { usuarioActual } from '../auth/authService';

export default function PedidosPage() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carrito, setCarrito] = useState({}); // { productoId: cantidad }
  const [error, setError] = useState('');
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
    setError('');
    const items = Object.entries(carrito)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }));

    if (items.length === 0) {
      setError('Selecciona al menos un producto');
      return;
    }

    try {
      await crearPedido({ usuarioId: usuario.id, items });
      setCarrito({});
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el pedido');
    }
  }

  return (
    <div>
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
        <button type="submit">Confirmar pedido</button>
      </form>

      <h2>Mis pedidos</h2>
      <div className="grilla">
        {pedidos.map((pedido) => (
          <div className="tarjeta" key={pedido.id}>
            <p>
              Pedido #{pedido.id} — <strong>{pedido.estado}</strong>
            </p>
            <ul>
              {pedido.items.map((item, idx) => (
                <li key={idx}>
                  {item.cantidad} × {item.nombreProducto} (${item.precioUnitario})
                </li>
              ))}
            </ul>
            <p>Total: ${pedido.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
