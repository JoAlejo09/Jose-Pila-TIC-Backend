import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({

    service:"gmail",

    auth:{
        user:process.env.USER_MAILTRAP,
        pass:process.env.PASS_MAILTRAP
    }

});

const generarTemplate = ({
    titulo,
    mensaje,
    botonTexto,
    botonUrl,
    footer
})=>{

    return `
        <div style=" background:#f3f4f6; padding:40px 20px; font-family:Arial,sans-serif;">
            <div style=" max-width:600px; margin:auto; background:white; border-radius:16px;
                overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <div style="background:#2563eb; padding:30px; text-align:center; color:white; ">
                    <h1 style=" margin:0; font-size:28px; ">
                        Refuerzo Académico
                    </h1>
                    <p style=" margin-top:10px; opacity:0.9; ">
                        Plataforma educativa personalizada
                    </p>
                </div>

                <div style=" padding:40px 30px; color:#374151; line-height:1.7; ">
                    <h2 style=" margin-top:0; color:#111827;">
                        ${titulo}
                    </h2>

                    <p> ${mensaje}</p>

                    ${ botonUrl
                        ?
                        ` <div style=" text-align:center; margin:35px 0;">
                                <a
                                    href="${botonUrl}"
                                    style="background:#2563eb; color:white; text-decoration:none;
                                           padding:14px 28px; border-radius:10px; display:inline-block;
                                           font-weight:bold;
                                    "
                                >
                                    ${botonTexto}
                                </a>
                            </div>
                        `
                        :
                        ""
                    }
                    <p style="font-size:14px; color:#6b7280; margin-top:40px;">
                        ${footer}
                    </p>
                </div>

                <div style=" background:#f9fafb; padding:20px; text-align:center;
                             font-size:13px; color:#6b7280; border-top:1px solid #e5e7eb;
                ">

                    © ${new Date().getFullYear()} Refuerzo Académico.
                    Todos los derechos reservados.
                </div>
            </div>
        </div>
    `;
};

//email para confirmacion de cuenta una vez creada
const enviarEmailConfirmacion = async({email, nombre, token })=>{
    const url = `${process.env.FRONTEND_URL_PRODUCTION}/confirmar/${token}`;
    const html = generarTemplate({
        titulo:`Hola ${nombre}`,
        mensaje:`
            Gracias por registrarte en nuestra plataforma.
            Para activar tu cuenta debes confirmar tu correo electrónico.
        `,
        botonTexto:"Confirmar Cuenta",
        botonUrl:url,
        footer:` Si no creaste esta cuenta,
            puedes ignorar este mensaje.
        `
    });

    await transporter.sendMail({
        from:`"Refuerzo Académico" <${process.env.USER_MAILTRAP}>`,
        to:email,
        subject:"Confirmación de Cuenta",
        html
    });

};
// EMAIL RECUPERACION

const enviarEmailRecuperacion = async({ email, nombre, token })=>{

    const url = `${process.env.FRONTEND_URL_PRODUCTION}/reset-password/${token}`;

    const html = generarTemplate({
        titulo:`Hola ${nombre}`,
        mensaje:`
            Hemos recibido una solicitud para restablecer tu contraseña.
            Haz clic en el siguiente botón para continuar.
        `,
        botonTexto:"Restablecer Contraseña",
        botonUrl:url,
        footer:`
            Si no solicitaste este cambio,
            ignora este mensaje y tu contraseña seguirá segura.
        `
    });

    await transporter.sendMail({
        from:`"Refuerzo Académico" <${process.env.USER_MAILTRAP}>`,
        to:email,
        subject:"Recuperación de Contraseña",
        html
    });

};

// EMAIL REACTIVACION
const enviarEmailReactivacion = async({ email, nombre, passwordTemporal })=>{
    const html = generarTemplate({
        titulo:`Hola ${nombre}`,
        mensaje:`
            Tu cuenta ha sido reactivada correctamente.
            Tu contraseña temporal es:
            <br><br>

            <strong style=" font-size:20px; color:#2563eb; ">
                ${passwordTemporal}
            </strong>
            <br><br>
            Por seguridad, deberás cambiarla
            después de iniciar sesión.
        `,

        botonTexto:"Iniciar Sesión",
        botonUrl:`${process.env.FRONTEND_URL_PRODUCTION}/login`,
        footer:`
            Si no solicitaste esta acción,
            contacta con soporte inmediatamente.
        `
    });

    await transporter.sendMail({
        from:`"Refuerzo Académico" <${process.env.USER_MAILTRAP}>`,
        to:email,
        subject:"Cuenta Reactivada",
        html
    });

};

export { enviarEmailConfirmacion, enviarEmailRecuperacion, enviarEmailReactivacion };