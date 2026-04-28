import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter = nodemailer.createTransport({
    service: "gmail",
    host:process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth:{
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP
    }
});

const enviarEmailConfirmacion = async ({email, nombre, token}) => {

//    const url = `${process.env.FRONTEND_URL}/confirmar/${token}`;//Para frontend
    const url = `http://localhost:4000/api/user/confirmar/${token}`;//Para backend
    let mailOptions = {
        from: `"Refuerzos Académicos" <no-reply@test.com>`,
        to: email,
        subject: "Confirmación de cuenta",
        html: `<h2>Hola ${nombre}</h2>
            <p>Has creado tu cuenta.</p>
            <p>Confirma tu cuenta en el siguiente enlace:</p>
            <a href="${url}">Confirmar Cuenta</a>
            <p>Si no creaste esta cuenta, ignora este mensaje.</p>
        `
    };
    await transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.error("Error al enviar el correo de confirmación:", error);
        }else{
            console.log("Correo de confirmación enviado: " + info.response);
        }
    } );
    
}
const enviarEmailRecuperacion = async ({email, nombre, token}) => {
    const url = `http://localhost:4000/api/user/reset-password/${token}`;
    let mailOptions = {
        from: `"Refuerzos Académicos" <no-reply@test.com>`,
        to: email,
        subject: "Recuperación de contraseña",
        html: `<h2>Hola ${nombre}</h2>
              <p>Has solicitado recuperar tu contraseña.</p>
              <a href="${url}">Restablecer contraseña</a>
                <p>Si no solicitaste esto, ignora este mensaje o cambia tu contraseña.</p>
        `
    };
    await transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.error("Error al enviar el correo de confirmación:", error);
        }else{
            console.log("Correo de cambio de contraseña enviado: " + info.response);
        }
    } );
    
}
export { enviarEmailConfirmacion, enviarEmailRecuperacion };


