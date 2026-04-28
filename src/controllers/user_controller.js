import Usuario from "../models/Usuario.js";
import enviarEmailConfirmacion from "../config/nodemailer.js";

const registrarUsuario = async (req, res) => {
    try{
        const {nombre, apellido, email, password, confirmpassword, rol } = req.body;
        //Validaciones
        if(!nombre || !apellido || !email || !password || !confirmpassword){
            return res.status(400).json({msg: "Algunos campos estan vacios. Son obligatorios"});
        }
        //Validacion de contraseñas
        if(password !== confirmpassword){
            return res.status(400).json({msg:"Las contraseñas no coinciden"});
        }
        if(password.length < 6){
            return res.status(400).json({msg:"La contraseña debe tener mínimo 6 caracteres"});
        }
        if(!email.includes("@")){
            return res.status(400).json({msg:"El email no es válido"});
        }
        //Validacion de rol
        let rolFinal = "estudiante";
        if (rol === "tutor") {
            rolFinal = "tutor";
        }
        //Existe el usuario
        const usuarioExiste = await Usuario.findOne({email});
        if(usuarioExiste){

            return res.status(400).json({msg:"El correo electronico ya se encuentra registrado"})
        }

        //Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            email,
            password,
            rol: rolFinal
        });
        let token= nuevoUsuario.generarToken();

        await nuevoUsuario.save();
        //Confirmacion de cuenta
        await enviarEmailConfirmacion({email: nuevoUsuario.email, nombre:nuevoUsuario.nombre, token:nuevoUsuario.token})
        res.status(201).json({msg:"Usuario registrado exitosamente. Por favor, revisa tu correo para confirmar tu cuenta."});
    }catch(error){
        console.error(error);
        res.status(500).json({msg: "Error del servidor"});
    }

}
const confirmarCuenta = async (req, res) =>{
    const {token} = req.params;
    try{
        const usuarioEncontrado = await Usuario.findOne({token});
        if(!usuarioEncontrado){
            return res.status(400).json({msg:"Token no válido"});
        }
        usuarioEncontrado.isVerified = true;
        usuarioEncontrado.token = null;
        await usuarioEncontrado.save();
        res.status(200).json({msg:"Cuenta confirmada exitosamente"});
    }
    catch(error){  
        console.error(error);
        res.status(500).json({msg:"Error del servidor"});
    }
}
export {registrarUsuario, confirmarCuenta}