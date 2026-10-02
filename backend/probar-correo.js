require("dotenv").config();
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function probarCorreo() {
  try {
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: "Prueba de correo - HexaMarket",
      text: "La configuracion de Nodemailer funciona correctamente.",
    });

    console.log("Correo enviado:", info.messageId);
    console.log("Vista previa:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error al enviar correo:", error.message);
  }
}

probarCorreo();
