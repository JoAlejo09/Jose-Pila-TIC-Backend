import Usuario from "../models/Usuario.js";
import Estudiante from "../models/Estudiante.js";
import Tema from "../models/Tema.js";
import Materia from "../models/Materia.js";
import Recurso from "../models/Recurso.js";
import Resultado from "../models/Resultado.js";

const obtenerMateriasEstudiante = async(req,res)=>{
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if(!usuario){
            return res.status(404).json({
                msg:"Usuario no encontrado"
            });
        }
        if(usuario.rol !== "estudiante"){
            return res.status(403).json({
                msg:"Acceso solo para estudiantes"
            });
        }
        const estudiante = await Estudiante.findOne({
            usuario: usuario._id
        });
        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }
        const nivelAcademico = estudiante.nivelAcademico;

        const temas = await Tema.find({
            estado:true,
            nivelAcademico
        }).populate({
            path:"materia",
            match:{estado:true}
        });
        const temasValidos = temas.filter((tema)=> tema.materia !== null);
        const materiasIds = temasValidos.map((tema)=> tema.materia._id.toString());
        const idsUnicos = [...new Set(materiasIds)];

        const materias = await Materia.find({
            _id:{$in: idsUnicos},
            estado:true
            }).sort({
            nombre:1
            });
        res.status(200).json(materias);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener materias del estudiante"
        });
    }
}
const obtenerTemasPorMateria = async(req,res)=>{
    try {
        const {materiaId} = req.params;
        const usuario = await Usuario.findById( req.usuario.id);
        if(!usuario){
            return res.status(404).json({
                msg:"Usuario no encontrado"
            });
        }
        if(usuario.rol !== "estudiante"){
            return res.status(403).json({
                msg:"Acceso solo estudiantes"
            });
        }
        const estudiante = await Estudiante.findOne({
            usuario: usuario._id});

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        const materia = await Materia.findById(materiaId);

        if(!materia || !materia.estado){
            return res.status(404).json({
                msg:"Materia no encontrada"
            });
        }
        const nivelAcademico = estudiante.nivelAcademico;

        // OBTENER TEMAS
        const temas = await Tema.find({
                materia:materiaId,
                nivelAcademico,
                estado:true
            })
            .populate( "materia", "nombre")
            .sort({ nombre:1});

        res.status(200).json(temas);

    } catch (error) {

        console.log(error);
        res.status(500).json({
            msg:"Error al obtener temas"
        });

    }

}
const obtenerRecursosPorTema = async(req,res)=>{

    try {
        const {temaId} = req.params;
        // USUARIO AUTENTICADO
        const usuario = await Usuario.findById(req.usuario.id);

        if(!usuario){
            return res.status(404).json({
                msg:"Usuario no encontrado"
            });
        }

        if(usuario.rol !== "estudiante"){
            return res.status(403).json({
                msg:"Acceso solo estudiantes"
            });
        }

        const estudiante = await Estudiante.findOne({ usuario: usuario._id});

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        const tema = await Tema.findById( temaId ).populate(
                "materia", "nombre");

        if(!tema || !tema.estado){
            return res.status(404).json({
                msg:"Tema no encontrado"
            });
        }

        // VALIDAR NIVEL
        if(tema.nivelAcademico !== estudiante.nivelAcademico){
            return res.status(403).json({
                msg:"Tema no disponible para su nivel"
            });
        }

        // OBTENER RECURSOS
        const recursos = await Recurso.find({ tema:temaId, estado:true})
            .populate({
                path:"tema",
                populate:{
                    path:"materia",
                    select:"nombre"
                }
            }).sort({
                createdAt:-1
            });

        res.status(200).json(recursos);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener recursos"
        });

    }

}
const obtenerResultadosEstudiante = async(req,res)=>{
    try {
        const resultados = await Resultado.find({
            estudiante: req.usuario._id
        }).populate({
            path:"cuestionario",
            select:`titulo
                    tipoEvaluacion
                    nivel
                    materia
                    tema`,
            populate:[
                { path:"materia",
                    select: "nombre"
                },{
                    path:"tema",
                    select:"nombre"
                }
            ]
        }).sort({createdAt:-1});
        res.json(resultados);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener resultados"
        });
        
    }
}
const obtenerResultadoEstudianteID = async(req,res)=>{
    try {
        const {id} = req.params;
        const resultado = await Resultado.findById(id)
            .populate({
                path:"cuestionario",
                select:`titulo
                        descripcion
                        instrucciones
                        tipoEvaluacion
                        nivel
                        materia
                        tema`,
                populate:[
                    {path:"materia", select:"nombre"},
                    {path:"tema",   select:"nombre"}
                ]
            })
            .populate({
                path:"respuesta.pregunta",
                select:`enunciado
                        tipoPregunta
                        opciones
                        recursoApoyo`
            });

            if(!resultado){
                return res.status(404).json({
                    msg:"Resultado no encontrado"
                })
            }
            if(resultado.estudiante.toString() !== req.usuario._id.toString()){
                return res.status(403).json({
                    msg:"No tiene permisos para ver este resultado"
                });
            }
            res.json(resultado);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener resultado"
        });
    }
}
export {obtenerMateriasEstudiante, obtenerTemasPorMateria,
        obtenerRecursosPorTema,
        obtenerResultadosEstudiante, obtenerResultadoEstudianteID};