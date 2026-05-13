import Cuestionario from "../models/Cuestionario.js";
import Pregunta from "../models/Pregunta.js";
import Resultado from "../models/Resultado.js";

const crearCuestionario = async(req,res)=>{
    try {

        const { titulo, descripcion, instrucciones, materia, tema, tipoEvaluacion,
                cantidadPreguntas, tiempoLimite, nivel, mostrarRevision } = req.body;

        let filtroPreguntas = { materia, estado:true};

        if(tipoEvaluacion === "tema"){
            filtroPreguntas.tema = tema;
        }

        const preguntas = await Pregunta.aggregate([
            {
                $match:filtroPreguntas
            },
            {
                $sample:{
                    size:Number(cantidadPreguntas)
                }
            }
        ]);
        if(preguntas.length === 0){
            return res.status(404).json({
                msg:"No existen preguntas disponibles"
            });
        }

        if(preguntas.length < cantidadPreguntas){
            return res.status(400).json({
                msg:`Solo existen ${preguntas.length} preguntas disponibles`
            });
        }

        const cuestionario = new Cuestionario({
            titulo, descripcion, instrucciones,materia,
            tema: tipoEvaluacion === "tema"
                ? tema
                : null,
            tipoEvaluacion,
            preguntas: preguntas.map(
                pregunta => pregunta._id
            ),
            cantidadPreguntas,
            tiempoLimite,
            nivel,
            mostrarRevision
        });

        await cuestionario.save();

        res.status(201).json({
            msg:"Cuestionario creado correctamente",
            cuestionario
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:"Error al crear cuestionario"});
    }

};
const obtenerCuestionarios = async(req,res)=>{
    try {
        const cuestionarios = await Cuestionario.find()
        .populate("materia", "nombre")
        .populate("tema", "nombre")
        .select(` titulo
            descripcion
            instrucciones
            tipoEvaluacion
            cantidadPreguntas
            tiempoLimite
            nivel
            mostrarRevision
            estado
            createdAt`)
            .sort({createdAt:-1})

        res.json(cuestionarios);
    } catch (error) { 
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener cuestionarios"
        });
    }
}
const obtenerCuestionariosDisponibles = async(req,res)=>{
    try {
        const cuestionarios = await Cuestionario.find({estado:true})
        .populate("materia","nombre")
        .populate("tema","nombre")
        .select(`
            titulo
            descripcion
            instrucciones
            tipoEvaluacion
            cantidadPreguntas
            tiempoLimite
            nivel
            createdAt`
        ).sort({createdAt:-1});

        res.json(cuestionarios);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener cuestionarios disponibles"
        });

    }

};
const obtenerCuestionariosID = async(req,res)=>{
    try {
        const {id} = req.params;
        const cuestionario = await Cuestionario.findById(id)
        .populate("materia", "nombre")
        .populate("tema","nombre")
        .populate({
            path:"preguntas",
            select:`enunciado
                    tipoPregunta
                    opciones
                    recursoApoyo
                    nivelDificultad
        `});

        if(!cuestionario){
            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });
        }
        if(!cuestionario.estado){
            return res.status(400).json({
                msg:"Cuestionario no disponible"
            });
        }
        res.json(cuestionario);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener cuestionario"
        });
    }
}
const resolverCuestionario = async(req,res)=>{
      try {
        const {id} = req.params;
        const { respuestas, tiempoEmpleado } = req.body;

        const cuestionario = await Cuestionario.findById(id)
        .populate("preguntas");
        if(!cuestionario){
            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });
        }

        if(!cuestionario.estado){
            return res.status(400).json({
                msg:"Cuestionario no disponible"
            });
        }

        let correctas = 0;
        let incorrectas = 0;
        let sinResponder = 0;
        const detalleRespuestas = [];

        for(const pregunta of cuestionario.preguntas){

            const respuestaUsuario = respuestas[pregunta._id] || "";
            let esCorrecta = false;

            // SIN RESPONDER
            if(respuestaUsuario === ""){
                sinResponder++;
            }
            // RESPUESTA CORRECTA
            else if(respuestaUsuario.toString().trim().toLowerCase() === pregunta.respuestaCorrecta
                    .toString().trim().toLowerCase()){
                correctas++;
                esCorrecta = true;
            }

            else{
                incorrectas++;
            }

            detalleRespuestas.push({
                pregunta:pregunta._id,
                respuestaUsuario,
                respuestaCorrecta: pregunta.respuestaCorrecta,
                esCorrecta,
                explicacion: pregunta.explicacion || ""
            });
        }

        const puntaje = ((correctas / cuestionario.preguntas.length) * 100).toFixed(2);

        const resultado = new ResultadoCuestionario({
            estudiante:req.usuario._id,
            cuestionario:id,
            respuestas:detalleRespuestas,
            correctas,
            incorrectas,
            sinResponder,
            puntaje,
            tiempoEmpleado
        });

        await resultado.save();
        res.json({
            msg:"Cuestionario resuelto correctamente",
            resultado:{correctas, incorrectas, sinResponder, puntaje, tiempoEmpleado},
            revision: cuestionario.mostrarRevision
                    ? detalleRespuestas
                    : []
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al resolver cuestionario"
        });
    }
}
const actualizarCuestionario = async(req,res)=>{
    try {
        const {id} = req.params;
        const { titulo, descripcion, instrucciones, tiempoLimite, nivel,
            mostrarRevision, estado } = req.body;

        const cuestionario = await Cuestionario.findById(id);

        if(!cuestionario){
            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });
        }

        // ACTUALIZAR CAMPOS
        cuestionario.titulo = titulo || cuestionario.titulo;
        cuestionario.descripcion = descripcion || cuestionario.descripcion;
        cuestionario.instrucciones = instrucciones || cuestionario.instrucciones;
        cuestionario.tiempoLimite = tiempoLimite || cuestionario.tiempoLimite;
        cuestionario.nivel = nivel || cuestionario.nivel;
        // BOOLEANOS
        if(typeof mostrarRevision === "boolean"){
            cuestionario.mostrarRevision = mostrarRevision;
        }
        if(typeof estado === "boolean"){
            cuestionario.estado = estado;
        }

        await cuestionario.save();
        res.json({ msg:"Cuestionario actualizado correctamente",
            cuestionario
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al actualizar cuestionario"
        });
    }

};
const eliminarCuestionario = async(req,res)=>{

    try {

        const {id} = req.params;


        const cuestionario = await Cuestionario.findById(id);


        if(!cuestionario){

            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });

        }


        // ELIMINACION LOGICA
        cuestionario.estado = false;


        await cuestionario.save();


        res.json({
            msg:"Cuestionario eliminado correctamente"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al eliminar cuestionario"
        });

    }

};
export {crearCuestionario, obtenerCuestionarios, obtenerCuestionariosDisponibles, obtenerCuestionariosID,
    actualizarCuestionario, resolverCuestionario, eliminarCuestionario
};