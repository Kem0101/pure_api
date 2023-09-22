// CONFIGURANDO EL ENVIO DE EMAIL DE CONFIRMACION

import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const emailRegister = async (datos: any) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as SMTPTransport.Options);

  // Destructurar los datos que recibe la función
  const { email, fullname, token } = datos;
  // Enviar el email
  const info = await transporter.sendMail({
    from: 'CristoGrand - Una red social pura',
    to: email,
    subject: 'Comprueba tu cuenta en CristoGrand',
    text: 'Comprueba tu cuenta en CristoGrand',
    html: `<p>Hola ${fullname}, comprueba tu cuenta en CristoGrand </p>
           <p> Tu cuenta ya esta lista solo debes comprobarla en el siguente enlace:
           <a href="${process.env.FRONTEND_URL}/confirmar/${token}"> Comprobar cuenta </a></p>

           <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje!</p>
    `,
  });
  console.log('Mensaje enviado: %s', info.messageId);
};

export default emailRegister;
