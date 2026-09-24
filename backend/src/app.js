require("dotenv").config();
const crearServidor = require("./infrastructure/config/server");

const PORT = process.env.PORT || 3000;
const app = crearServidor();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
