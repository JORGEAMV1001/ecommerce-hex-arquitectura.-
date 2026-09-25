import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./modules/auth/LoginPage";
import RegistroPage from "./modules/auth/RegistroPage";
import ProductosPage from "./modules/productos/ProductosPage";
import PedidosPage from "./modules/pedidos/PedidosPage";
import GestionUsuariosPage from "./modules/usuarios/GestionUsuariosPage";
import RutaProtegida from "./router/RutaProtegida";
import SinAccesoPage from "./router/SinAccesoPage";
import { usuarioActual, logout } from "./modules/auth/authService";

function Barra() {
  
  const usuario = usuarioActual();
  const navigate = useNavigate();
  const esAdmin = usuario?.rol === "administrador";

  function manejarSalir() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="barra">
        <span className="marca">HexaMarket</span>
      {usuario && (esAdmin || usuario.permisos?.includes("catalogo")) && <Link to="/productos">Catálogo</Link>}
      {usuario && (esAdmin || usuario.permisos?.includes("pedidos")) && <Link to="/pedidos">Mis pedidos</Link>}
      {esAdmin && <Link to="/usuarios">Usuarios</Link>}
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
          <Route path="/sin-acceso" element={<SinAccesoPage />} />
          <Route
            path="/productos"
            element={
              <RutaProtegida modulo="catalogo">
                <ProductosPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/pedidos"
            element={
              <RutaProtegida modulo="pedidos">
                <PedidosPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/usuarios"
            element={
              <RutaProtegida soloAdmin>
                <GestionUsuariosPage />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}