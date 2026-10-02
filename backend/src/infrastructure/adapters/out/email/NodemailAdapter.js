const nodemailer = require("nodemailer");
const EmailServicePort = require("../../../../application/ports/out/EmailServicePort");
const {
  plantillaComprobanteCliente,
  plantillaNuevoPedidoAdmin,
} = require("./emailTemplates");

const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function esLimiteDeEnvios(error) {
  return (
    error?.responseCode === 550 ||
    /too many emails/i.test(error?.message || "")
  );
}

class NodemailAdapter extends EmailServicePort {
  // Cola interna: los envíos salen uno por uno y con una pausa mínima
  // entre ellos, para respetar el límite por segundo del proveedor.
  #cola = Promise.resolve();
  #ultimoEnvio = 0;

  constructor(transporter, remitente, intervaloMinimoMs = 1500) {
    super();
    this.transporter = transporter;
    this.remitente = remitente;
    this.intervaloMinimoMs = intervaloMinimoMs;
  }

  static desdeEntorno() {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 2525),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    return new NodemailAdapter(
      transporter,
      process.env.MAIL_FROM || "HexaMarket <no-reply@hexamarket.test>",
      Number(process.env.MAIL_INTERVALO_MS || 1500),
    );
  }

  /**
   * Envía respetando el intervalo mínimo y reintenta (hasta 3 veces)
   * cuando el proveedor responde que se excedió el límite.
   */
  #enviar(mensaje) {
    const turno = this.#cola.then(async () => {
      const maxIntentos = 3;

      for (let intento = 1; intento <= maxIntentos; intento++) {
        const espera =
          this.intervaloMinimoMs - (Date.now() - this.#ultimoEnvio);
        if (espera > 0) await pausa(espera);

        try {
          return await this.transporter.sendMail(mensaje);
        } catch (error) {
          if (esLimiteDeEnvios(error) && intento < maxIntentos) {
            await pausa(this.intervaloMinimoMs * intento);
            continue;
          }
          throw error;
        } finally {
          this.#ultimoEnvio = Date.now();
        }
      }
    });

    // Un fallo no debe bloquear los envíos siguientes de la cola
    this.#cola = turno.catch(() => {});
    return turno;
  }

  async enviarComprobanteCompra({ cliente, pedido, items, instruccionesPago }) {
    const { subject, text, html } = plantillaComprobanteCliente({
      cliente,
      pedido,
      items,
      instruccionesPago,
    });

    const info = await this.#enviar({
      from: this.remitente,
      to: cliente.email,
      subject,
      text,
      html,
    });

    return {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  }

  async notificarNuevoPedido({ administradorEmail, cliente, pedido, items }) {
    const { subject, text, html } = plantillaNuevoPedidoAdmin({
      cliente,
      pedido,
      items,
    });

    const info = await this.#enviar({
      from: this.remitente,
      to: administradorEmail,
      subject,
      text,
      html,
    });

    return {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  }
}

module.exports = NodemailAdapter;