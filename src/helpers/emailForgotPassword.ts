// CONFIGURANDO EL ENVIO DE EMAIL DE RESTABLECER OlvidePassword

import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const emailOlvidePassword = async (datos: any) => {
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
    subject: 'Reestablecer tu password',
    text: 'Reestablecer tu password',
    html: `<p>Hola ${fullname}, has solicitado reestables tu password </p>

           <p> Sigue el siguente enlace para generar un nuevo password:
           <a href="${process.env.FRONTEND_URL}/olvide-password/${token}"> Reestablecer password </a></p>

           <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje!</p>
    `,
  });
  console.log('Mensaje enviado: %s', info.messageId);
};

export default emailOlvidePassword;
