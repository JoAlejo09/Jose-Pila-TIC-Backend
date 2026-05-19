import Resultado from "../models/Resultado.js";

// Obtener resultados del estudiante

const obtenerResultadosEstudiante = async(req,res)=>{
    try {

        const resultados = await Resultado.find({
            estudiante:req.usuario.id
        })
        .populate({
            path:"cuestionario",
            select:`
                titulo
                tipoEvaluacion
                tipoCuestionario
                nivel
                materia
                tema
                createdAt
            `,
            populate:[
                {
                    path:"materia",
                    select:"nombre"
                },
                {
                    path:"tema",
                    select:"nombre"
                }
            ]
        })
        .sort({createdAt:-1});
        console.log(resultados)

        return res.json(resultados);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg:"Error al obtener resultados"
        });
    }
};

// Obtener detalle de resultado

const obtenerResultadoPorId = async(req,res)=>{
    try {

        const { id } = req.params;

        const resultado = await Resultado.findById(id)
        .populate({
            path:"cuestionario",
            populate:[
                {
                    path:"materia",
                    select:"nombre"
                },
                {
                    path:"tema",
                    select:"nombre"
                }
            ]
        })
        .populate({
            path:"respuestas.pregunta",
            select:"enunciado"
        });

        if(!resultado){
            return res.status(404).json({
                msg:"Resultado no encontrado"
            });
        }

        if(
            resultado.estudiante.toString()
            !==
            req.usuario.id
        ){
            return res.status(403).json({
                msg:"No autorizado"
            });
        }

        return res.json(resultado);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg:"Error al obtener resultado"
        });
    }
};

export {
    obtenerResultadosEstudiante,
    obtenerResultadoPorId
};