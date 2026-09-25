import { Navigate } from "react-router-dom";
import { usuarioActual } from "../modules/auth/authService";

/**
 * Bloquea el acceso a rutas que requieren sesión iniciada.
 * - modulo: si se indica ("catalogo" | "pedidos"), exige que el usuario
 *   tenga ese permiso asignado por un administrador (o sea administrador).
 * - soloAdmin: si es true, exige rol administrador.
 */
export default function RutaProtegida({ children, modulo, soloAdmin }) {
  const usuario = usuarioActual();
  if (!usuario) return <Navigate to="/login" replace />;

  const esAdmin = usuario.rol === "administrador";
  if (soloAdmin && !esAdmin) return <Navigate to="/sin-acceso" replace />;
  if (modulo && !esAdmin && !usuario.permisos?.includes(modulo)) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return children;
}