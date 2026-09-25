import { useEffect, useState } from "react";
import {
  listarUsuarios,
  actualizarPrivilegios,
  crearUsuarioComoAdmin,
  eliminarUsuario,
} from "./usuariosService";

const MODULOS = [
  { clave: "catalogo", etiqueta: "Catálogo" },
  { clave: "pedidos", etiqueta: "Pedidos" },
];

function estadoInfo(estado) {
  if (estado === "aprobado")
    return { texto: "Aprobado", clase: "estado-aprobado" };
  if (estado === "rechazado")
    return { texto: "Rechazado", clase: "estado-rechazado" };
  return { texto: "Pendiente", clase: "estado-pendiente" };
}

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [borradores, setBorradores] = useState({}); // id -> { permisos, rol }
  const [guardandoId, setGuardandoId] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [nuevo, setNuevo] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "cliente",
    permisos: [],
  });
  const [errorNuevo, setErrorNuevo] = useState("");
  const [exitoNuevo, setExitoNuevo] = useState(false);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
      const iniciales = {};
      data.forEach((u) => {
        iniciales[u.id] = { permisos: u.permisos || [], rol: u.rol };
      });
      setBorradores(iniciales);
    } catch (err) {
      setError(
        err.response?.data?.error || "No se pudo cargar la lista de usuarios",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function alternarPermiso(id, modulo) {
    setBorradores((b) => {
      const actual = b[id]?.permisos || [];
      const nuevoArreglo = actual.includes(modulo)
        ? actual.filter((m) => m !== modulo)
        : [...actual, modulo];
      return { ...b, [id]: { ...b[id], permisos: nuevoArreglo } };
    });
  }

  function cambiarRolBorrador(id, rol) {
    setBorradores((b) => ({ ...b, [id]: { ...b[id], rol } }));
  }

  async function guardar(id, estadoForzado) {
    setGuardandoId(id);
    setError("");
    try {
      const draft = borradores[id] || {};
      const usuario = usuarios.find((u) => u.id === id);
      const actualizado = await actualizarPrivilegios(id, {
        estado: estadoForzado || usuario.estado,
        permisos: draft.permisos || [],
        rol: draft.rol || usuario.rol,
      });
      setUsuarios((lista) => lista.map((u) => (u.id === id ? actualizado : u)));
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el cambio");
    } finally {
      setGuardandoId(null);
    }
  }

  function alternarPermisoNuevo(modulo) {
    setNuevo((n) => ({
      ...n,
      permisos: n.permisos.includes(modulo)
        ? n.permisos.filter((m) => m !== modulo)
        : [...n.permisos, modulo],
    }));
  }

  async function crear(e) {
    e.preventDefault();
    setErrorNuevo("");
    setExitoNuevo(false);
    try {
      await crearUsuarioComoAdmin(nuevo);
      setExitoNuevo(true);
      setNuevo({
        nombre: "",
        email: "",
        password: "",
        rol: "cliente",
        permisos: [],
      });
      cargar();
    } catch (err) {
      setErrorNuevo(err.response?.data?.error || "No se pudo crear el usuario");
    }
  }

  async function eliminar(id, nombre) {
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar a "${nombre}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    setGuardandoId(id);
    setError("");
    try {
      await eliminarUsuario(id);
      setUsuarios((lista) => lista.filter((u) => u.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo eliminar el usuario (puede que ya tenga pedidos registrados)",
      );
    } finally {
      setGuardandoId(null);
    }
  }

  return (
    <div>
      <h2>Gestión de usuarios</h2>

      <div className="tarjeta">
        <h3>Agregar nuevo usuario</h3>
        <form onSubmit={crear}>
          <label>Nombre</label>
          <input
            value={nuevo.nombre}
            onChange={(e) =>
              setNuevo((n) => ({ ...n, nombre: e.target.value }))
            }
            required
          />
          <label>Email</label>
          <input
            type="email"
            value={nuevo.email}
            onChange={(e) => setNuevo((n) => ({ ...n, email: e.target.value }))}
            required
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={nuevo.password}
            onChange={(e) =>
              setNuevo((n) => ({ ...n, password: e.target.value }))
            }
            required
          />
          <small>Mínimo 8 caracteres, una mayúscula y un número.</small>
          <label>Rol</label>
          <select
            value={nuevo.rol}
            onChange={(e) => setNuevo((n) => ({ ...n, rol: e.target.value }))}
          >
            <option value="cliente">Cliente</option>
            <option value="administrador">Administrador</option>
          </select>
          {nuevo.rol === "cliente" && (
            <div className="permisos-checks">
              {MODULOS.map((m) => (
                <label key={m.clave} className="check-linea">
                  <input
                    type="checkbox"
                    checked={nuevo.permisos.includes(m.clave)}
                    onChange={() => alternarPermisoNuevo(m.clave)}
                  />
                  {m.etiqueta}
                </label>
              ))}
            </div>
          )}
          {errorNuevo && <p className="error">{errorNuevo}</p>}
          {exitoNuevo && <p className="exito">Usuario creado y aprobado.</p>}
          <button type="submit">Crear usuario</button>
        </form>
      </div>

      <div className="tarjeta">
        <h3>Usuarios registrados</h3>
        {error && <p className="error">{error}</p>}
        {cargando ? (
          <p>Cargando…</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tabla-usuarios">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Catálogo</th>
                  <th>Pedidos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const draft = borradores[u.id] || {
                    permisos: [],
                    rol: u.rol,
                  };
                  const info = estadoInfo(u.estado);
                  const esAdmin = draft.rol === "administrador";
                  return (
                    <tr key={u.id}>
                      <td>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={draft.rol}
                          onChange={(e) =>
                            cambiarRolBorrador(u.id, e.target.value)
                          }
                        >
                          <option value="cliente">Cliente</option>
                          <option value="administrador">Administrador</option>
                        </select>
                      </td>
                      <td>
                        <span className={info.clase}>{info.texto}</span>
                      </td>
                      {MODULOS.map((m) => (
                        <td key={m.clave} style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            disabled={esAdmin}
                            checked={
                              esAdmin || draft.permisos.includes(m.clave)
                            }
                            onChange={() => alternarPermiso(u.id, m.clave)}
                          />
                        </td>
                      ))}
                      <td className="acciones-usuario">
                        {u.estado === "pendiente" && (
                          <button
                            type="button"
                            onClick={() => guardar(u.id, "aprobado")}
                            disabled={guardandoId === u.id}
                          >
                            Aprobar
                          </button>
                        )}
                        {u.estado !== "rechazado" && (
                          <button
                            type="button"
                            className="btn-secundario"
                            onClick={() => guardar(u.id, "rechazado")}
                            disabled={guardandoId === u.id}
                          >
                            Rechazar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-secundario"
                          onClick={() => guardar(u.id)}
                          disabled={guardandoId === u.id}
                        >
                          Guardar privilegios
                        </button>
                        <button
                          type="button"
                          className="btn-peligro"
                          onClick={() => eliminar(u.id, u.nombre)}
                          disabled={guardandoId === u.id}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
