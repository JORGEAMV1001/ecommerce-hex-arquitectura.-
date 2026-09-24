import apiClient from "../../services/apiClient";

export async function registrar({ nombre, email, password }) {
  const { data } = await apiClient.post("/usuarios/registro", { nombre, email, password });
  return data;
}

export async function login({ email, password }) {
  const { data } = await apiClient.post("/usuarios/login", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function usuarioActual() {
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}
