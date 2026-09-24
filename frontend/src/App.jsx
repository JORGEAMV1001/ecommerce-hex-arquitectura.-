import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./modules/auth/LoginPage";
import RegistroPage from "./modules/auth/RegistroPage";
import ProductosPage from "./modules/productos/ProductosPage";
import PedidosPage from "./modules/pedidos/PedidosPage";
import RutaProtegida from "./router/RutaProtegida";
import { usuarioActual, logout } from "./modules/auth/authService";

function Barra() {
  const usuario = usuarioActual();
  const navigate = useNavigate();

  function manejarSalir() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="barra">
      <Link to="/productos">Catálogo</Link>
      {usuario && <Link to="/pedidos">Mis pedidos</Link>}
      <span className="espaciador" />
      {usuario ? (
        <>
          <span>{usuario.nombre} ({usuario.rol})</span>
          <button onClick={manejarSalir}>Salir</button>
        </>
      ) : (
        <>
          <Link to="/login">Entrar</Link>
          <Link to="/registro">Registrarme</Link>
        </>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Barra />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route
            path="/pedidos"
            element={
              <RutaProtegida>
                <PedidosPage />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
