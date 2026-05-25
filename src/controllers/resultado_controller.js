import Resultado from "../models/Resultado.js";

// Obtener resultados del estudiante
const obtenerResultadosEstudiante = async(req,res)=>{
    try {

        console.log(req.usuario.id);
        const resultados = await Resultado.find({
            estudiante:req.usuario.id
        })
        .populate({
            path:"cuestionario",
            select:`
                titulo
                tipoEvaluacion
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
            select:`enunciado opciones respuestaCorrecta explicacion`
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
        console.log(resultado)
        return res.json(resultado);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg:"Error al obtener resultado"
        });
    }
};

//Para reporte de estudiantes que rindieron la evaluacion
const obtenerResultadosAdmin = async(req,res)=>{
    try {
        const {estudiante, materia, tema, nivelAcademico} = req.query; 
        let filtro = {};
        
        let resultados = await Resultado.find(filtro)
        .populate({
            path:"estudiante",
            select:`nombre apellido email`
        })
        .populate({
            path:"cuestionario",
            select:`titulo nivelAcademico materia tema`,
            populate:[
                {
                    path:"materia",
                    select:"nombre"
                },{
                    path:"tema",
                    select:"nombre"
                }
            ]
        })
        .sort({createdAt:-1});

        if(estudiante){
            resultados = resultados.filter((resultado)=>{

                const nombreCompleto = `
                    ${resultado.estudiante?.usuario?.nombre || ""}
                    ${resultado.estudiante?.usuario?.apellido || ""}
                `.toLowerCase();

                return nombreCompleto.includes(
                    estudiante.toLowerCase()
                );

            });
        }
        if(materia){

            resultados = resultados.filter((resultado)=>
                resultado.cuestionario?.materia?.nombre
                ?.toLowerCase()
                .includes(materia.toLowerCase())
            );
        }
        if(tema){

            resultados = resultados.filter((resultado)=>
                resultado.cuestionario?.tema?.nombre
                ?.toLowerCase()
                .includes(tema.toLowerCase())
            );

        }
        if(nivelAcademico){
            resultados = resultados.filter((resultado)=>
                resultado.cuestionario?.nivelAcademico === nivelAcademico
            );
        }

        return res.status(200).json(resultados);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Error al obtener resultados"
        });
    }
}

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
        const resultados = await Resultado.find({
            estudiante:req.usuario.id
        })
        .populate("materia","nombre")
        .populate("cuestionario", "titulo tipoEvaluacion")
        .sort({createdAt:-1})
        .limit(2);

        res.json(resultados)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener ultimos resultados"
        });
    }
}

export {
    obtenerResultadosEstudiante, obtenerResultadoPorId, obtenerResultadosAdmin,
    obtenerResultadoAdminPorId, eliminarResultadoAdmin, obtenerUltimosResultados
};