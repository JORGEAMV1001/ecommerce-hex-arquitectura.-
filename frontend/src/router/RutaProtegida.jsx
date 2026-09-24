import { Navigate } from "react-router-dom";
import { usuarioActual } from "../modules/auth/authService";

/** Bloquea el acceso a rutas que requieren sesión iniciada */
export default function RutaProtegida({ children }) {
  const usuario = usuarioActual();
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}
