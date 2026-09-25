import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from './authService';

export default function RegistroPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const navigate = useNavigate();

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');
    try {
      await registrar(form);
      setExito(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    }
  }

  return (
    <div className="tarjeta">
      <h2>Crear cuenta</h2>
      <form onSubmit={manejarEnvio}>
        <label>Nombre</label>
        <input value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} required />

        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => actualizar('email', e.target.value)} required />

        <label>Contraseña</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => actualizar('password', e.target.value)}
          required
        />
        <small>Mínimo 8 caracteres, una mayúscula y un número.</small>

        {error && <p className="error">{error}</p>}
        {exito && (
          <p className="exito">
            Cuenta creada. Un administrador debe aprobar tu acceso antes de que puedas iniciar sesión.
          </p>
        )}
        <button type="submit">Registrarme</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}