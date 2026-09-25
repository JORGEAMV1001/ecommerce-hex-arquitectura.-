import apiClient from "../../services/apiClient";

export async function listarUsuarios() {
  const { data } = await apiClient.get("/usuarios/");
  return data;
}

export async function actualizarPrivilegios(id, { estado, permisos, rol }) {
  const { data } = await apiClient.patch(`/usuarios/${id}/privilegios`, { estado, permisos, rol });
  return data;
}

export async function crearUsuarioComoAdmin({ nombre, email, password, rol, permisos }) {
  const { data } = await apiClient.post("/usuarios/", { nombre, email, password, rol, permisos });
  return data;
}
export async function eliminarUsuario(id) {
  const { data } = await apiClient.delete(`/usuarios/${id}`);
  return data;
}