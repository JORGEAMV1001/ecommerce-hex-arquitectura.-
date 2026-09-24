import apiClient from "../../services/apiClient";

export const crearPedido = (pedido) => apiClient.post("/pedidos", pedido).then((r) => r.data);
export const listarPedidos = (usuarioId) =>
  apiClient.get("/pedidos", { params: usuarioId ? { usuarioId } : {} }).then((r) => r.data);
export const obtenerPedido = (id) => apiClient.get(`/pedidos/${id}`).then((r) => r.data);
export const actualizarEstadoPedido = (id, estado) =>
  apiClient.patch(`/pedidos/${id}/estado`, { estado }).then((r) => r.data);
