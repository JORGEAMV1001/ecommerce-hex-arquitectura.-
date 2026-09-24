import { useEffect, useState } from 'react';
import { listarProductos, crearProducto, eliminarProducto } from './productosService';
import { usuarioActual } from '../auth/authService';

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', stock: '' };

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState('');
  const usuario = usuarioActual();
  const esAdmin = usuario?.rol === 'administrador';

  async function cargar() {
    setProductos(await listarProductos());
  }

  useEffect(() => {
    cargar();
  }, []);

  async function manejarAlta(e) {
    e.preventDefault();
    setError('');
    try {
      await crearProducto({
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock),
      });
      setForm(FORM_VACIO);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el producto');
    }
  }

  async function manejarEliminar(id) {
    await eliminarProducto(id);
    cargar();
  }

  return (
    <div>
      <h2>Catálogo de productos</h2>

      {esAdmin && (
        <form className="tarjeta" onSubmit={manejarAlta}>
          <h3>Nuevo producto</h3>
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <input
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Agregar producto</button>
        </form>
      )}

      <div className="grilla">
        {productos.map((p) => (
          <div className="tarjeta producto" key={p.id}>
            <h3>{p.nombre}</h3>
            <p>{p.descripcion}</p>
            <p>
              <strong>${p.precio}</strong> — stock: {p.stock}
            </p>
            {esAdmin && <button onClick={() => manejarEliminar(p.id)}>Eliminar</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
