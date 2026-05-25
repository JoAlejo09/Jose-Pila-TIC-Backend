import Estudiante from "../models/Estudiante.js";
import Recurso from "../models/Recurso.js";
import Tema from "../models/Tema.js";
import Unidad from "../models/Unidad.js";
import { registrarUsoRecurso } from "./progresoacademico_controller.js";

const obtenerRecursos = async(req, res)=>{
    try {
        const recursos = await Recurso.find().populate({
                path:"tema",
                populate:{
                    path:"unidad",
                    populate:{
                        path:"materia",
                        select:"nombre"
                    }
                }
            }
        ).sort({createdAt: -1});
        res.status(200).json(recursos);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            msg:"Error al obtener los recursos"
        });
    }
} 
const crearRecurso = async(req, res)=>{
    try {
        const {tema, titulo, descripcion, tipo, url, contenido, nivelDificultad} = req.body;

        if(!tema || !titulo || !tipo){
            return res.status(400).json({
                msg:"Campos obligatorios"
            });
        }
        const tiposValidos = ["pdf","youtube", "teoria"];
        if(!tiposValidos.includes(tipo)){
            return res.status(400).json({
                msg:"Tipo de recurso no valido"
            });
        }
        const temaExiste = await Tema.findById(tema);
        if(!temaExiste){
            return res.status(404).json({
                msg:"Tema no encontrado"  
            });
        }
        if (!temaExiste.estado){
            return res.status(400).json({
                msg:"El tema esta inactivo"
            });
        }
        if((tipo === "pdf" || tipo === "youtube") && !url){
            return res.status(400).json({
                msg:"La URL es obigatoria"
            });
        }
        if(tipo === "teoria" && !contenido){
            return res.status(400).json({
                msg:"El contenido es obligatorio"
            });
        }
        const nuevoRecurso = new Recurso({
            tema,
            titulo: titulo.trim(),
            descripcion: descripcion?.trim() || "",
            tipo,
            url: url || "",
            contenido: contenido?.trim() || "",
            nivelDificultad: nivelDificultad || "basico"
        });
        await nuevoRecurso.save();

        const recursoGuardado = await Recurso.findById(nuevoRecurso._id).populate({
            path:"tema",
            populate:{
                path:"unidad",
                populate:{
                    path:"materia",
                    select:"nombre"
                }
            }
        });
        res.status(201).json({
            msg:"Recurso creado correctamente",
            recurso: recursoGuardado
        });

    } catch (error) {
        res.status(500).json({
            msg:"Error al crear recurso"
        });
    }
}
const actualizarRecurso = async(req,res)=>{
    try {
        const {id} = req.params;
        const { tema, titulo, descripcion, tipo, url, contenido, nivelDificultad, estado } = req.body;

        const recurso = await Recurso.findById(id);
        if(!recurso){
            return res.status(404).json({
                msg:"Recurso no encontrado"
            });
        }

        if(tema){
            const temaExiste = await Tema.findById(tema);
            if(!temaExiste){
                return res.status(404).json({
                    msg:"Tema no encontrado"
                });
            }
            if(!temaExiste.estado){
                return res.status(400).json({
                    msg:"El tema está inactivo"
                });
            }
            recurso.tema = tema;
        }

        const tipoFinal = tipo || recurso.tipo;
        const tiposValidos = [ "pdf", "youtube", "teoria" ];
        if(!tiposValidos.includes(tipoFinal)){
            return res.status(400).json({
                msg:"Tipo inválido"
            });
        }

        const urlFinal = url !== undefined
                ? url
                : recurso.url;

        const contenidoFinal = contenido !== undefined
                ? contenido
                : recurso.contenido;

        if((tipoFinal === "pdf" || tipoFinal === "youtube") && !urlFinal){
            return res.status(400).json({
                msg:"La URL es obligatoria"
            });
        }

        if( tipoFinal === "teoria" && !contenidoFinal ){
            return res.status(400).json({
                msg:"El contenido es obligatorio"
            });
        }

        if(titulo){
            recurso.titulo = titulo.trim();
        }

        if(descripcion !== undefined){
            recurso.descripcion = descripcion.trim() || "";
        }

        if(tipo){ recurso.tipo = tipo; }

        if(url !== undefined){ recurso.url = url; }

        if(contenido !== undefined){
            recurso.contenido = contenido.trim(); }

        if(nivelDificultad){ recurso.nivelDificultad = nivelDificultad; }

        if(estado !== undefined){ recurso.estado = estado; }

        await recurso.save();

        const recursoActualizado = await Recurso.findById( recurso._id).populate({
                path:"tema",
                populate:{
                    path:"unidad",
                    populate:{
                        path:"materia",
                        select:"nombre"
                    }
                }
            });

        res.status(200).json({
            msg:"Recurso actualizado correctamente",
            recurso: recursoActualizado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al actualizar recurso"
        });
    }

}
const cambiarEstadoRecurso = async(req,res)=>{
    try {
        const {id} = req.params;
        const recurso = Recurso.findById(id);
        if(!recurso){
            return res.status(404).json({
                msg:"Recurso no encontrado"
            });
        }
        recurso.estado = !recurso.estado;
        await recurso.save();
        const recursoActualizado = await Recurso.findById(recurso._id).populate({
            path:"tema",
            populate:{
                path:"unidad",
                populate:{
                    path:"materia",
                    select:"nombre"
                }
            }
        });
        res.status(200).json({
            msg:`Recurso ${recurso.estado
                ? "activado"
                : "desactivado"
            } correctamente`,
            recurso: recursoActualizado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al cambiar estado del recurso"
        })        
    }
}
const obtenerRecursoID = async(req,res)=>{
    try {
        const {id} = req.params;

        const usuario = await Usuario.findById(req.usuario.id);

        if(!usuario){
             return res.status(404).json({
                msg:"Usuario no encontrado"
            });
        }

        const recurso = await Recurso.findById(id).populate({
            path:"tema",
            populate:{
                path:"unidad",
                populate:{
                    path:"materia",
                    select:"nombre"
                }
            }
        });
        if(!recurso || !recurso.estado){
            return res.status(404).json({
                msg:"Recurso no encontrado"
            });
        }

        if(usuario.rol === "estudiante"){
            const estudiante = await Estudiante.findOne({
                usuario:usuario._id
            });
            if(!estudiante){
                return res.status(404).json({
                    msg:"Perfil estudiante no encontrado"
                });
            }
            if(recurso.tema.unidad.materia.nivelAcademico !== estudiante.nivelAcademico){
                 return res.status(403).json({
                    msg:"Recurso no disponible para su nivel"
                });
            }
            await registrarUsoRecurso(
                estudiante._id,
                recurso._id,
                recurso.tipo
            )
        }
        res.status(200).json(recurso);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener recurso"
        });
    }
}
export {obtenerRecursos, crearRecurso, actualizarRecurso,
    cambiarEstadoRecurso, obtenerRecursoID
}
