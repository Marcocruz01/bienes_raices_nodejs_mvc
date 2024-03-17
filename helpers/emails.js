import nodemailer from 'nodemailer';

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "12446c0573000a",
          pass: "1f85049b23431e"
        }
      });
    const {correo, nombre, token} = datos;

    // Enviar el email
    await transport.sendMail({
        from: 'Bienesraices.com',
        to: correo,
        subject: 'Confirma tu cuenta en Bienesraices.com',
        text: 'Confirma tu cuenta en Bienesraices.com',
        html: `
            <p>Hola ${nombre}, hemos enviado este correo eléctronico para que confirmes tu cuenta en Bienestaices.com</p>
            <p>Tu cuenta ya esta lista solo confirmala en el siguiente enlace
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a>
            </p>
            <p>Si tu no creaste esta cuenta, ignora el correo eléctronico</p>
        `
    });
}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "12446c0573000a",
          pass: "1f85049b23431e"
        }
      });
    const {correo, nombre, token} = datos;

    // Enviar el email
    await transport.sendMail({
        from: 'Bienesraices.com',
        to: correo,
        subject: 'Restablece tu contraseña en Bienesraices.com',
        text: 'Restablece tu contraseña en Bienesraices.com',
        html: `
            <p>Hola ${nombre}, hemos enviado este correo eléctronico debido a que solicitaste restablecer tu contraseña en Bienestaices.com</p>
            <p>Sigue el siguiente enlace para poder cambiar tu contraseña por una nueva:
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer password</a>
            </p>
            <p>Si tu no solicitaste el cambio de password, ignora el correo eléctronico</p>
        `
    });
}

export {
    emailRegistro,
    emailOlvidePassword
}