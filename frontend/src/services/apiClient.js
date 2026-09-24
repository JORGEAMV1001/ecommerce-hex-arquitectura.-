import axios from "axios";

/**
 * Adaptador de red aislado: única capa que sabe cómo hablar con el backend.
 * Los módulos (auth, productos, pedidos) nunca llaman a axios directamente.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Adjunta el JWT guardado tras el login a cada petición saliente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
