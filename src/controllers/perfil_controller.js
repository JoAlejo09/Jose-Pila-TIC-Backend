import Usuario from "../models/Usuario.js";
import Estudiante from "../models/Estudiante.js";
import Tutor from "../models/Tutor.js";
import cloudinary from "../config/cloudinary.js"

const obtenerPerfil= async (req, res)=>{
    try {
        const usuario = await Usuario.findById(req.usuario.id).select("-password");
        if(!usuario){
            return res.status(404).json({
                msg:"Usuario no encontrado"
            })
        }
        let perfil = null;
        if(usuario.rol === "estudiante"){
            perfil = await Estudiante.findOne({
                usuario:usuario._id
            });
        }
        if(usuario.rol ==="tutor"){
            perfil = await Tutor.findOne({
                usuario: usuario._id
            });
        }
        res.status(200).json({
            usuario, perfil
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener perfil el usuario."
        })        
    }
}
const actualizarPerfil = async(req,res)=>{
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if(!usuario){
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        const {nombre, apellido} = req.body;
        if(nombre) usuario.nombre = nombre;
        if(apellido) usuario.apellido = apellido;
        await usuario.save();

        let perfil = null;
        if(usuario.rol === "estudiante"){
            perfil = await Estudiante.findOne({
                usuario: usuario._id
            });
        if(!perfil){ return res.status(404).json({msg:"Perfil estudiante no encontrado"})};
        const {telefono, direccion, fechaNacimiento, institucion, curso,
            nivelAcademico, fotoPerfil} =req.body;
            if(telefono !== undefined) perfil.telefono = telefono;
            if(direccion !== undefined) perfil.direccion = direccion;
            if(fechaNacimiento !== undefined) perfil.fechaNacimiento = fechaNacimiento;
            if(institucion !== undefined) perfil.institucion = institucion;
            if(curso !== undefined) perfil.curso = curso;
            if(nivelAcademico !== undefined) perfil.nivelAcademico = nivelAcademico;
            if(fotoPerfil !== undefined) perfil.fotoPerfil = fotoPerfil;

            await perfil.save();

        }
        if(usuario.rol === "tutor"){
            perfil = await Tutor.findOne({usuario: usuario._id});
            if(!perfil){
                return res.status(404).json({
                    msg:"Perfil tutor no encontrado"
                });
            }
            const {telefono, especialidad, descripcion, experiencia, titulacion, fotoPerfil}= req.body;

            if(telefono !== undefined) perfil.telefono = telefono;
            if(especialidad !== undefined) perfil.especialidad = especialidad;
            if(descripcion !== undefined) perfil.descripcion = descripcion;
            if(experiencia !== undefined) perfil.experiencia = experiencia;
            if(titulacion !== undefined) perfil.titulacion = titulacion;
            if(fotoPerfil !== undefined) perfil.fotoPerfil = fotoPerfil;
            await perfil.save();
        }
        res.status(200).json({
            msg:"Perfil actualizado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al actualizar perfil"
        });        
    }
}
const actualizarFotoPerfil = async(req,res)=>{
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if(!usuario){
            return res.status(404).json({msg:"Usuario no encontrado"});
        }
        if(!req.file){
            return res.status(400).json({
                msg:"No se envio la imagen."
            });
        }
        const resultado = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder:"perfiles",
                transformation:[
                    {
                        width:300,
                        height:300,
                        crop:"fill",
                        quality:"auto",
                        fetch_format:"auto"
                    }
                ]
            }
        );
        let perfil = null;
        if(usuario.rol === "estudiante"){
            perfil = await Estudiante.findOne({
                usuario: usuario._id
            });
        }
        if(usuario.rol === "tutor"){
            perfil = await Tutor.findOne({
                usuario: usuario._id
              });
        }
        if(!perfil){
            return res.status(404).json({
                msg:"Perfil no encontrado"
            })
        }
        perfil.fotoPerfil = resultado.secure_url;
        await perfil.save();

        res.status(200).json({
            msg:"Foto actualizada correctamente",
            fotoPerfil: resultado.secure_url
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            msg:"Error al actualizar foto"
        });
    }
}
export {obtenerPerfil, actualizarPerfil, actualizarFotoPerfil};