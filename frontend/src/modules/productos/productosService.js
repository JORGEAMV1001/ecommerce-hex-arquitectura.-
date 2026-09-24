import apiClient from "../../services/apiClient";

export const listarProductos = () => apiClient.get("/productos").then((r) => r.data);
export const obtenerProducto = (id) => apiClient.get(`/productos/${id}`).then((r) => r.data);
export const crearProducto = (producto) => apiClient.post("/productos", producto).then((r) => r.data);
export const actualizarProducto = (id, producto) =>
  apiClient.put(`/productos/${id}`, producto).then((r) => r.data);
export const eliminarProducto = (id) => apiClient.delete(`/productos/${id}`).then((r) => r.data);
