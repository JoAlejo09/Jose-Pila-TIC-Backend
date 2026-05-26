import Usuario from "../models/Usuario.js";
import Estudiante from "../models/Estudiante.js";

import { enviarEmailConfirmacion, enviarEmailRecuperacion, enviarEmailReactivacion } from "../config/nodemailer.js";

import generarJWT from "../config/JWT.js";


// REGISTRAR NUEVO USUARIO
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, password, confirmpassword, rol } = req.body;

        if (!nombre || !apellido || !email || !password || !confirmpassword ) {
            return res.status(400).json({
                msg: "Algunos campos están vacíos"
            });
        }
        if (password !== confirmpassword) {
            return res.status(400).json({
                msg: "Las contraseñas no coinciden"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                msg: "La contraseña debe tener mínimo 6 caracteres"
            });
        }
        if (!email.includes("@")) {
            return res.status(400).json({
                msg: "Email no válido"
            });
        }
        // VALIDAR ROL
        let rolFinal = "estudiante";
        if (rol === "tutor") {
            rolFinal = "tutor";
        }
        // VALIDAR EXISTENCIA
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({
                msg: "El correo ya se encuentra registrado"
            });
        }
        const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            email,
            rol: rolFinal
        });
        nuevoUsuario.password = await nuevoUsuario.encryptPassword(password);
        nuevoUsuario.generarToken();
        await nuevoUsuario.save();

        await enviarEmailConfirmacion({
            email: nuevoUsuario.email,
            nombre: nuevoUsuario.nombre,
            token: nuevoUsuario.token
        });
        res.status(201).json({
            msg: "Usuario registrado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al registrar usuario"
        });
    }
};
// CONFIRMAR CUENTA
const confirmarCuenta = async (req, res) => {
    try {
        const { token } = req.params;
        const usuarioEncontrado = await Usuario.findOne({ token });
        if (!usuarioEncontrado) {
            return res.status(400).json({
                msg: "Token no válido"
            });
        }
        usuarioEncontrado.isVerified = true;
        usuarioEncontrado.token = null;
        await usuarioEncontrado.save();
        res.status(200).json({
            msg: "Cuenta confirmada correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error del servidor"
        });
    }
};
// LOGIN
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                msg: "Email y contraseña obligatorios"
            });
        }
        const usuarioEncontrado = await Usuario.findOne({ email })
                                .select("+password");
        if (!usuarioEncontrado) {
            return res.status(400).json({
                msg: "Usuario no encontrado"
            });
        }
        if (!usuarioEncontrado.isActive) {
            return res.status(403).json({
                msg: "Tu cuenta está deshabilitada"
            });
        }
        if (!usuarioEncontrado.isVerified) {
            return res.status(403).json({
                msg: "Tu cuenta no ha sido verificada",
                noVerificada: true,
                email: usuarioEncontrado.email
            });
        }

        const passwordValida = await usuarioEncontrado.matchPassword(password);
        if (!passwordValida) {
            return res.status(400).json({
                msg: "Contraseña incorrecta"
            });
        }
        const token = generarJWT({
            id: usuarioEncontrado._id,
            email: usuarioEncontrado.email,
            rol: usuarioEncontrado.rol
        });
        res.status(200).json({
            msg: "Inicio de sesión exitoso",
            token,
            user: {
                id: usuarioEncontrado._id,
                nombre: usuarioEncontrado.nombre,
                apellido: usuarioEncontrado.apellido,
                email: usuarioEncontrado.email,
                rol: usuarioEncontrado.rol,
                fotoPerfil: usuarioEncontrado.fotoPerfil,
                perfilCompleto: usuarioEncontrado.perfilCompleto
            },
            debeCambiarPassword: usuarioEncontrado.debeCambiarPassword
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al iniciar sesión"
        });
    }
};
// RECUPERAR PASSWORD
const recuperarContrasena = async (req, res) => {
    try {
        const { email } = req.body;
        const usuarioEncontrado = await Usuario.findOne({ email });
        if (!usuarioEncontrado) {
            return res.status(400).json({
                msg: "Usuario no encontrado"
            });
        }
        usuarioEncontrado.generarToken();
        await usuarioEncontrado.save();
        await enviarEmailRecuperacion({
            email: usuarioEncontrado.email,
            nombre: usuarioEncontrado.nombre,
            token: usuarioEncontrado.token
        });
        res.status(200).json({
            msg: "Correo enviado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error del servidor"
        });
    }
};
// COMPROBAR TOKEN
const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const usuarioEncontrado = await Usuario.findOne({ token });
    if (!usuarioEncontrado) {
        return res.status(400).json({
            msg: "Token no válido"
        });
    }
    res.status(200).json({
        msg: "Token válido"
    });
};
// CREAR NUEVO PASSWORD
const crearNuevoPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmpassword } = req.body;
        const usuarioEncontrado = await Usuario.findOne({ token });
        if (!usuarioEncontrado) {
            return res.status(400).json({
                msg: "Token no válido"
            });
        }
        if (password !== confirmpassword) {
            return res.status(400).json({
                msg: "Las contraseñas no coinciden"
            });
        }
        usuarioEncontrado.password = await usuarioEncontrado.encryptPassword(password);
        usuarioEncontrado.token = null;
        await usuarioEncontrado.save();
        res.status(200).json({
            msg: "Contraseña actualizada"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error del servidor"
        });
    }
};
//Reenviar confirmacion de cuenta
const reenviarConfirmacion = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                msg: "Email requerido"
            });
        }
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({
                msg: "Usuario no encontrado"
            });
        }
        if (usuario.isVerified) {
            return res.status(400).json({
                msg: "La cuenta ya está verificada"
            });
        }
        usuario.generarToken();
        await usuario.save();
        await enviarEmailConfirmacion({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        });

        res.status(200).json({
            msg: "Correo reenviado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error del servidor"
        });
    }
};
// Cambio Contraseña Obligatorio
const cambiarPasswordObligatorio = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id)
                        .select("+password");
        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        const { password, confirmpassword } = req.body;
        if (!password || !confirmpassword) {
            return res.status(400).json({
                msg: "Todos los campos son obligatorios"
            });
        }
        if (password !== confirmpassword) {
            return res.status(400).json({
                msg: "Las contraseñas no coinciden"
            });
        }
        usuario.password = await usuario.encryptPassword(password);
        usuario.debeCambiarPassword = false;
        await usuario.save();
        res.status(200).json({
            msg: "Contraseña actualizada correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error del servidor"
        });

    }

};
//Obtener usuarios con busqueda personalizada
const obtenerUsuarios = async (req, res) => {

    try {

        const { search } = req.query;

        let filtro = {};

        if (search) {

            filtro = {

                $or: [

                    {
                        nombre: {
                            $regex: search,
                            $options: "i"
                        }
                    },

                    {
                        apellido: {
                            $regex: search,
                            $options: "i"
                        }
                    },

                    {
                        email: {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ]
            };
        }

        const usuarios = await Usuario.find(filtro)
            .select("-password -token");

        // OBTENER DATOS ESTUDIANTE

        const usuariosConNivel = await Promise.all(

            usuarios.map(async (usuario) => {

                let nivelAcademico = null;

                if (usuario.rol === "estudiante") {

                    const estudiante =
                        await Estudiante.findOne({

                            usuario: usuario._id

                        }).select("nivelAcademico");

                    nivelAcademico =
                        estudiante?.nivelAcademico || null;
                }

                return {

                    ...usuario.toObject(),

                    nivelAcademico
                };
            })
        );

        return res.status(200).json(
            usuariosConNivel
        );

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            msg: "Error al obtener usuarios"

        });
    }
};

//FUNCIONALIDADES PARA ADMIN

//Crear nuevo usuario por admin
const crearUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol } = req.body;

        if ( !nombre || !apellido || !email || !password ) {
            return res.status(400).json({
                msg: "Campos obligatorios"
            });
        }

        const existe = await Usuario.findOne({ email });
        if (existe) {
            return res.status(400).json({
                msg: "El usuario ya está registrado"
            });
        }
        const rolesValidos = ["admin", "tutor", "estudiante" ];
        const rolFinal = rolesValidos.includes(rol)
                ? rol
                : "estudiante";

        const usuario = new Usuario({
            nombre,
            apellido,
            email,
            rol: rolFinal
        });

        usuario.password = await usuario.encryptPassword(password);
        usuario.token = null;
        usuario.isVerified = true;
        await usuario.save();
        res.status(201).json({
            msg: "Usuario creado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al crear usuario"
        });
    }
};
// Actualizar informacion usuario Admin
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, rol, password, fotoPerfil } = req.body;

        const usuario = await Usuario.findById(id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        if (nombre) usuario.nombre = nombre;
        if (apellido) usuario.apellido = apellido;
        if (email) usuario.email = email;
        if (rol) usuario.rol = rol;
        if (fotoPerfil) {
            usuario.fotoPerfil = fotoPerfil;
        }
        if ( password && password.trim() !== "" ) {
            usuario.password = await usuario.encryptPassword(password);
        }
        await usuario.save();
        res.status(200).json({
            msg: "Usuario actualizado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al actualizar usuario"
        });
    }
};
// Dar de baja usuario por Admin
const desactivarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        usuario.isActive = false;
        await usuario.save();
        res.status(200).json({
            msg: "Usuario desactivado"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al desactivar usuario"
        });
    }
};
//Activar un usuario por admin
const activarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        const passwordTemporal = Math.random().toString(36).slice(-8);

        usuario.password = await usuario.encryptPassword(passwordTemporal);

        usuario.isActive = true;
        usuario.debeCambiarPassword = true;
        await usuario.save();
        await enviarEmailReactivacion({
            email: usuario.email,
            nombre: usuario.nombre,
            passwordTemporal
        });
        res.status(200).json({
            msg: "Usuario activado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al activar usuario"
        });
    }
};


export { registrarUsuario, confirmarCuenta, loginUsuario, recuperarContrasena, comprobarToken, crearNuevoPassword, reenviarConfirmacion, cambiarPasswordObligatorio, obtenerUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario, activarUsuario };