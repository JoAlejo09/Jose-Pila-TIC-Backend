import Resultado from "../models/Resultado.js";
import Estudiante from "../models/Estudiante.js";

// Obtener resultados del estudiante
const obtenerResultadosEstudiante = async (req, res) => {

    try {

        // OBTENER PERFIL DEL ESTUDIANTE
        const estudiante = await Estudiante.findOne({
            usuario: req.usuario.id
        });

        if (!estudiante) {

            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        // OBTENER RESULTADOS
        const resultados = await Resultado.find({
            estudiante: estudiante._id
        })
        .populate({
            path: "cuestionario",
            select: `
                titulo
                tipoEvaluacion
                nivel
                materia
                tema
                createdAt
            `,
            populate: [
                {
                    path: "materia",
                    select: "nombre"
                },
                {
                    path: "tema",
                    select: "nombre"
                }
            ]
        })
        .sort({ createdAt: -1 });

        return res.status(200).json(resultados);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg: "Error al obtener resultados"
        });
    }
};

// Obtener detalle de resultado
const obtenerResultadoPorId = async(req,res)=>{

    try {

        const { id } = req.params;

        // OBTENER PERFIL ESTUDIANTE
        const estudiante = await Estudiante.findOne({
            usuario: req.usuario.id
        });

        if(!estudiante){

            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        // BUSCAR RESULTADO
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
            select:`
                enunciado
                opciones
                respuestaCorrecta
                explicacion
            `
        });

        if(!resultado){

            return res.status(404).json({
                msg:"Resultado no encontrado"
            });
        }

        // VALIDAR PROPIETARIO
        if(
            resultado.estudiante.toString()
            !==
            estudiante._id.toString()
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


//Para reporte de estudiantes que rindieron la evaluacion
const obtenerResultadosAdmin = async (req, res) => {

    try {

        const {
            estudiante,
            materia,
            tema,
            nivelAcademico
        } = req.query;

        let resultados = await Resultado.find()

            .populate({
                path: "estudiante",
                select: "nombre apellido email"
            })

            .populate({
                path: "cuestionario",
                select: "titulo nivelAcademico materia tema",
                populate: [
                    {
                        path: "materia",
                        select: "nombre"
                    },
                    {
                        path: "tema",
                        select: "nombre"
                    }
                ]
            })

            .sort({ createdAt: -1 });

        // FILTRO ESTUDIANTE
        if (estudiante) {

            resultados = resultados.filter((resultado) => {

                const nombreCompleto = `
                    ${resultado.estudiante?.nombre || ""}
                    ${resultado.estudiante?.apellido || ""}
                `.toLowerCase();

                return nombreCompleto.includes(
                    estudiante.toLowerCase()
                );

            });

        }

        // FILTRO MATERIA
        if (materia) {

            resultados = resultados.filter((resultado) =>

                resultado.cuestionario?.materia?.nombre
                    ?.toLowerCase()
                    .includes(
                        materia.toLowerCase()
                    )

            );

        }

        // FILTRO TEMA
        if (tema) {

            resultados = resultados.filter((resultado) =>

                resultado.cuestionario?.tema?.nombre
                    ?.toLowerCase()
                    .includes(
                        tema.toLowerCase()
                    )

            );

        }

        // FILTRO NIVEL
        if (nivelAcademico) {

            resultados = resultados.filter((resultado) =>

                resultado.cuestionario?.nivelAcademico
                === nivelAcademico

            );

        }
        

        return res.status(200).json(resultados);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg: "Error al obtener resultados"
        });

    }

};

//Visualizar resultado por el admin
const obtenerResultadoAdminPorId = async(req,res)=>{
    try {
        const { id } = req.params;
        
        const resultado = await Resultado.findById(id)
        .populate({
            path:"estudiante",
            select:`nombre apellido email`
        })
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
            select: `enunciado opciones respuestaCorrecta explicacion`
        });

        if(!resultado){
            return res.status(404).json({
                msg:"Resultado no encontrado"
            });
        }
        return res.status(200).json(resultado)
    } catch (error) {
        console.log(error);
        return res.status(500).json({   
            msg:"Error al obtener resultado"
        });
    }
}

const eliminarResultadoAdmin = async(req,res)=>{
    try {
        const {id} = req.params;

        const resultado = await Resultado.findById(id);

        if(!resultado){
            return res.status(404).json({
                msg:"Resultado no encontrado"
            });
        }
        await resultado.deleteOne();
        return res.status(200).json({
            msg:"Resultado eliminado correctamente"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Error al eliminar el resultado"
        })
    }
}

const obtenerUltimosResultados = async(req,res)=>{
    try {

        const estudiante = await Estudiante.findOne({
            usuario:req.usuario.id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        const resultados = await Resultado.find({
            estudiante:estudiante._id
        })
        .populate("materia","nombre")
        .populate("cuestionario", "titulo tipoEvaluacion")
        .sort({createdAt:-1})
        .limit(2);

        return res.json(resultados);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg:"Error al obtener ultimos resultados"
        });
    }
}

export {
    obtenerResultadosEstudiante, obtenerResultadoPorId, obtenerResultadosAdmin,
    obtenerResultadoAdminPorId, eliminarResultadoAdmin, obtenerUltimosResultados
};