import Usuario from "../models/Usuario.js";
import {enviarEmailConfirmacion, enviarEmailRecuperacion} from "../config/nodemailer.js";
import generarJWT from "../config/JWT.js";
import { trusted } from "mongoose";

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

        res.status(200).json({msg:"Cuenta confirmada correctamente"});
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
            user:{
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
        console.log(token);
        console.log(password);
        console.log(confirmpassword)
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

/*ACCIONES PARA ADMIN */
const obtenerUsuarios = async(req,res)=>{
  try {
    const { search } = req.query;

    let filtro = {};

    if (search) {
      filtro = {
        $or: [
          { nombre: { $regex: search, $options: "i" } },
          { apellido: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
    }

    const usuarios = await Usuario.find(filtro)
      .select("-password -token");

    res.json(usuarios);

  } catch (error) {
    res.status(500).json({ msg: "Error al obtener usuarios" });
  }
};
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ msg: "Campos obligatorios" });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ msg: "El usuario ya está registrado" });
    }

    const rolesValidos = ["admin", "tutor", "estudiante"];
    const rolFinal = rolesValidos.includes(rol) ? rol : "estudiante";

    const usuario = new Usuario({
      nombre,
      apellido,
      email,
      rol: rolFinal,
    });

    usuario.password = await usuario.encryptPassword(password);
    usuario.token = null;
    usuario.isVerified = true;

    await usuario.save();

    res.status(201).json({
      msg: "Usuario creado."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear usuario" });
  }
}
const actualizarUsuario = async(req,res)=>{
    try{
        const {id} = req.params;
        const { nombre, apellido, email, rol, password } = req.body;

        const usuario = await Usuario.findById(id);
        if(!usuario){
            return res.status(404).json({msg:"Usuario no encontrado"});
        }
        if(nombre) usuario.nombre = nombre;
        if(apellido) usuario.apellido = apellido;
        if(email) usuario.email = email;
        
        if(rol && req.usuario.rol == "admin"){
            usuario.rol = rol;
        }
        if(password){
            usuario.password = await usuario.encryptPassword(password)
        }
        await usuario.save();
        res.status(201).json({msg:"Usuario actualizado correctamente"})
    }catch(error){
        res.status(500).json({msg:"Error al actualizar el Usuario"})
    }
}
const desactivarUsuario = async(req,res)=>{
    try{
        const {id} = req.params;
        const usuario = await Usuario.findById(id);
        if(!usuario){
            return res.status(404).json({msg:"Usuario no encontrado"})
        }
        usuario.isActive = false;
        await usuario.save();
        res.status(201).json({msg:"Usuario desactivado"});
    }catch(error){
        res.status(500).json({msg:"Error al desactivar usuario"});
    }
};
const activarUsuario = async(req,res)=>{
    try{
        const {id} = req.params;
        const usuario = await Usuario.findById(id);
        if(!usuario){
            return res.status(404).json({msg:"Usuario no encontrado"})
        }
        usuario.isActive = true;
        await usuario.save();
        res.status(201).json({msg:"Usuario Activado"});
    }catch(error){
        res.status(500).json({msg:"Error al activar usuario"});
    }
};
export {registrarUsuario, confirmarCuenta, loginUsuario, recuperarContrasena, comprobarToken, crearNuevoPassword,
        obtenerUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario,activarUsuario};  