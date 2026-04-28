import Usuario from "../models/Usuario.js";
import {enviarEmailConfirmacion, enviarEmailRecuperacion} from "../config/nodemailer.js";
import generarJWT from "../config/JWT.js";

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
        //Encriptar password

        //Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            email,
            rol: rolFinal
        });
        let nuevoPasswordEncriptado = await nuevoUsuario.encryptPassword(password);
        nuevoUsuario.password = nuevoPasswordEncriptado;
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
const loginUsuario = async (req, res) => {
    try {
        const {email, password} = req.body;
        //Validaciones campos vacios
        if(!email || !password){
            return res.status(400).json({msg:"Aun tiene campos vacios. Email y contraseña requeridos"});
        }
        //Encontrar usuario
        const usuarioEncontrado = await Usuario.findOne({email}).select("+password");
        if(!usuarioEncontrado){
            return res.status(400).json({msg:"Usuario no encontrado. Registrese para iniciar sesión"});
        }
        //Validaciones usuario
        if(!usuarioEncontrado.isActive){
            return res.status(403).json({
                msg:"Tu cuenta esta deshabilitada"
            });
        }
        if(!usuarioEncontrado.isVerified){
            return res.status(403).json({
                msg:"Tu cuenta no ha sido verificada. Por favor, revisa tu correo para confirmar tu cuenta."
            });
        }
        //Validar contraseña
        const passwordValida = await usuarioEncontrado.matchPassword(password);
        if(!passwordValida){
            return res.status(400).json({msg:"Contraseña incorrecta"});
        }
        //Generacion del token JWT
        const token = generarJWT({id: usuarioEncontrado._id, email: usuarioEncontrado.email, rol: usuarioEncontrado.rol});

        res.status(200).json({msg:"Inicio de sesión exitoso",
            token,
            usuario:{
                id: usuarioEncontrado._id,
                nombre: usuarioEncontrado.nombre,
                apellido: usuarioEncontrado.apellido,
                email: usuarioEncontrado.email,
                rol: usuarioEncontrado.rol
            }
        });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({msg:"Error del servidor"});
    }
}
const recuperarContrasena= async(req,res)=>{
    try{
        const {email}= req.body;
        const usuarioEncontrado = await Usuario.findOne({email});
        if(!usuarioEncontrado){
            return res.status(400).json({msg:"Usuario no encontrado"});
        }
        usuarioEncontrado.generarToken();
        await usuarioEncontrado.save();
        await enviarEmailRecuperacion({
            email: usuarioEncontrado.email,
            nombre: usuarioEncontrado.nombre,
            token: usuarioEncontrado.token
        });
        res.json({msg:"Se ha enviado un correo con las instrucciones para recuperar tu contraseña"});
    }catch(error){ 
        console.error(error);
        res.status(500).json({msg:"Error del servidor"});
    }
}
const comprobarToken = async(req, res)=>{
    const {token} = req.params;
    const usuarioEncontrado = await Usuario.findOne({token});
    if (!usuarioEncontrado){
        return res.status(400).json({msg:"Token no válido"});
    }
    res.status(200).json({msg:"Token válido, el usuario existe"});
}
const crearNuevoPassword = async(req, res)=>{
    try{
        const {token} = req.params;
        const {password, confirmpassword} = req.body;
        const usuarioEncontrado = await Usuario.findOne({token});
        if (!usuarioEncontrado){
            return res.status(400).json({msg:"Token no válido"});
        }
        if(password !== confirmpassword){
            return res.status(400).json({msg:"Las contraseñas no coinciden"});
        }
        usuarioEncontrado.password = await usuarioEncontrado.encryptPassword(password);
        usuarioEncontrado.token = null;
        await usuarioEncontrado.save();
        res.status(200).json({msg:"Contraseña actualizada exitosamente"});
    }catch(error){
        console.error(error);
        res.status(500).json({msg:"Error del servidor"});
    }
}
export {registrarUsuario, confirmarCuenta, loginUsuario, recuperarContrasena, comprobarToken, crearNuevoPassword};  