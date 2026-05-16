import Usuario from "../models/Usuario.js";
import Estudiante from "../models/Estudiante.js";
import Tutor from "../models/Tutor.js";
import cloudinary from "../config/cloudinary.js";

const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id)
        .select("-password");

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        let perfil = null;
        if (usuario.rol === "estudiante") {
            perfil = await Estudiante.findOne({
                usuario: usuario._id
            });
        }
        if (usuario.rol === "tutor") {

            perfil = await Tutor.findOne({
                usuario: usuario._id
            });
        }
        res.status(200).json({
            usuario,
            perfil
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener perfil"
        });
    }
};

const actualizarPerfil = async (req, res) => {
    try {

        const usuario = await Usuario.findById(
            req.usuario.id
        );

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        const { nombre, apellido } = req.body;

        if (nombre !== undefined) {
            usuario.nombre = nombre;
        }
        if (apellido !== undefined) {
            usuario.apellido = apellido;
        }
        await usuario.save();

        let perfil = null;

        if (usuario.rol === "estudiante") {
            perfil = await Estudiante.findOne({
                usuario: usuario._id
            });
            if (!perfil) {
                perfil = new Estudiante ({
                    usuario: usuario._id
                });
            }

            const { telefono, direccion, fechaNacimiento, institucion } = req.body;

            if (telefono !== undefined) {
                perfil.telefono = telefono;
            }
            if (direccion !== undefined) {
                perfil.direccion = direccion;
            }
            if (fechaNacimiento !== undefined) {
                perfil.fechaNacimiento = fechaNacimiento;
            }
            if (institucion !== undefined) {
                perfil.institucion = institucion;
            }
            await perfil.save();
        }
        if (usuario.rol === "tutor") {
            perfil = await Tutor.findOne({
                usuario: usuario._id
            });
            if (!perfil) {
                perfil = new Tutor({
                    usuario: usuario._id
                })
            }
            const { telefono, especialidad, descripcion, experiencia, titulacion } = req.body;

            if (telefono !== undefined) {
                perfil.telefono = telefono;
            }
            if (especialidad !== undefined) {
                perfil.especialidad = especialidad;
            }
            if (descripcion !== undefined) {
                perfil.descripcion = descripcion;
            }
            if (experiencia !== undefined) {
                perfil.experiencia = experiencia;
            }
            if (titulacion !== undefined) {
                perfil.titulacion = titulacion;
            }
            await perfil.save();
        }
        usuario.perfilCompleto = true;
        await usuario.save();
        
        res.status(200).json({
            msg: "Perfil actualizado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al actualizar perfil"
        });
    }
};

const actualizarFotoPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findById(
            req.usuario.id
        );
        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                msg: "No se envió la imagen"
            });
        }
        const resultado = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "perfiles",
                transformation: [
                    {
                        width: 300,
                        height: 300,
                        crop: "fill",
                        quality: "auto",
                        fetch_format: "auto"
                    }
                ]
            }
        );
        usuario.fotoPerfil = resultado.secure_url;
        await usuario.save();
        res.status(200).json({
            msg: "Foto actualizada correctamente",
            fotoPerfil: resultado.secure_url
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al actualizar foto"
        });
    }
};
export {
    obtenerPerfil,
    actualizarPerfil,
    actualizarFotoPerfil
};