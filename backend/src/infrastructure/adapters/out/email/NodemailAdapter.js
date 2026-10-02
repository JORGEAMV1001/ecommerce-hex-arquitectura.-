const nodemailer = require("nodemailer");
const EmailServicePort = require("../../../../application/ports/out/EmailServicePort");
const {
  plantillaComprobanteCliente,
  plantillaNuevoPedidoAdmin,
} = require("./emailTemplates");

class NodemailAdapter extends EmailServicePort {
  constructor(transporter, remitente) {
    super();
    this.transporter = transporter;
    this.remitente = remitente;
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
    );
  }

  async enviarComprobanteCompra({ cliente, pedido, items, instruccionesPago }) {
    const { subject, text, html } = plantillaComprobanteCliente({
      cliente,
      pedido,
      items,
      instruccionesPago,
    });

    const info = await this.transporter.sendMail({
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

    const info = await this.transporter.sendMail({
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
