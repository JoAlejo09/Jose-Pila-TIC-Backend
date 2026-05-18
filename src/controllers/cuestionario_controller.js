import Cuestionario from "../models/Cuestionario.js";
import Pregunta from "../models/Pregunta.js";
import Resultado from "../models/Resultado.js";


// CREAR CUESTIONARIO
const crearCuestionario = async(req,res)=>{
    try {
        const { titulo, descripcion, instrucciones, materia, tema,
                tipoEvaluacion, modoGeneracion, preguntas, cantidadPreguntas,
                tiempoLimite, nivel, mostrarRevision } = req.body;

        if(
            !titulo ||
            !materia ||
            !tipoEvaluacion ||
            !modoGeneracion ||
            !cantidadPreguntas
        ){

            return res.status(400).json({
                msg:"Campos obligatorios"
            });

        }


        let preguntasSeleccionadas = [];


        // CUESTIONARIO MANUAL
        if(modoGeneracion === "manual"){

            if(!preguntas || preguntas.length === 0){

                return res.status(400).json({
                    msg:"Debe seleccionar preguntas"
                });

            }

            preguntasSeleccionadas = preguntas;

        }


        // CUESTIONARIO DINAMICO
        if(modoGeneracion === "dinamico"){

            let filtroPreguntas = {
                materia,
                estado:true,
                nivelDificultad:nivel
            };

            if(tipoEvaluacion === "tema"){

                filtroPreguntas.tema = tema;

            }

            const preguntasDB = await Pregunta.aggregate([
                {
                    $match:filtroPreguntas
                },
                {
                    $sample:{
                        size:Number(cantidadPreguntas)
                    }
                }
            ]);

            if(preguntasDB.length < cantidadPreguntas){

                return res.status(400).json({
                    msg:`Solo existen ${preguntasDB.length} preguntas disponibles`
                });

            }

            preguntasSeleccionadas =
                preguntasDB.map(
                    pregunta => pregunta._id
                );

        }


        const cuestionario = new Cuestionario({

            titulo,
            descripcion,
            instrucciones,

            materia,

            tema:
                tipoEvaluacion === "tema"
                ? tema
                : null,

            tipoEvaluacion,

            modoGeneracion,

            preguntas:preguntasSeleccionadas,

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

        res.status(500).json({
            msg:"Error al crear cuestionario"
        });

    }

};


// OBTENER CUESTIONARIOS
const obtenerCuestionarios = async(req,res)=>{

    try {

        const cuestionarios = await Cuestionario.find()

        .populate("materia","nombre")

        .populate("tema","nombre")

        .sort({createdAt:-1});


        res.json(cuestionarios);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al obtener cuestionarios"
        });

    }

};


// OBTENER CUESTIONARIOS DISPONIBLES
const obtenerCuestionariosDisponibles = async(req,res)=>{

    try {

        const cuestionarios = await Cuestionario.find({
            estado:true
        })

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
            createdAt
        `)

        .sort({createdAt:-1});


        res.json(cuestionarios);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al obtener cuestionarios disponibles"
        });

    }

};


// OBTENER CUESTIONARIO POR ID
const obtenerCuestionarioID = async(req,res)=>{

    try {

        const {id} = req.params;


        const cuestionario = await Cuestionario.findById(id)

        .populate("materia","nombre")

        .populate("tema","nombre")

        .populate({
            path:"preguntas",
            select:`
                enunciado
                tipoPregunta
                opciones
                recursoApoyo
                nivelDificultad
            `
        });


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

};


// RESOLVER CUESTIONARIO
const resolverCuestionario = async(req,res)=>{

    try {

        const {id} = req.params;

        const {
            respuestas,
            tiempoEmpleado
        } = req.body;


        const cuestionario = await Cuestionario.findById(id)

        .populate("preguntas");


        if(!cuestionario){

            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });

        }


        let correctas = 0;
        let incorrectas = 0;
        let sinResponder = 0;

        const detalleRespuestas = [];


        for(const pregunta of cuestionario.preguntas){

            const respuestaEncontrada =
                respuestas.find(
                    r =>
                        r.pregunta ===
                        pregunta._id.toString()
                );

            const respuestaUsuario =
                respuestaEncontrada?.respuestaUsuario || "";


            let esCorrecta = false;


            // SIN RESPONDER
            if(!respuestaUsuario){

                sinResponder++;

            }

            // CORRECTA
            else if(

                respuestaUsuario
                    .toString()
                    .trim()
                    .toLowerCase()

                ===

                pregunta.respuestaCorrecta
                    .toString()
                    .trim()
                    .toLowerCase()

            ){

                correctas++;
                esCorrecta = true;

            }

            // INCORRECTA
            else{

                incorrectas++;

            }


            detalleRespuestas.push({

                pregunta:pregunta._id,

                respuestaUsuario,

                respuestaCorrecta:
                    pregunta.respuestaCorrecta,

                esCorrecta,

                explicacion:
                    pregunta.explicacion || ""

            });

        }


        const puntaje = Number(

            (
                (correctas / cuestionario.preguntas.length)
                * 100
            ).toFixed(2)

        );


        const resultado = new Resultado({

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

            resultado:{

                correctas,
                incorrectas,
                sinResponder,
                puntaje,
                tiempoEmpleado

            },

            revision:
                cuestionario.mostrarRevision
                ? detalleRespuestas
                : []

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al resolver cuestionario"
        });

    }

};


// ACTUALIZAR
const actualizarCuestionario = async(req,res)=>{

    try {

        const {id} = req.params;

        const {
            titulo,
            descripcion,
            instrucciones,
            tiempoLimite,
            nivel,
            mostrarRevision,
            estado
        } = req.body;


        const cuestionario =
            await Cuestionario.findById(id);


        if(!cuestionario){

            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });

        }


        if(titulo !== undefined){
            cuestionario.titulo = titulo;
        }

        if(descripcion !== undefined){
            cuestionario.descripcion = descripcion;
        }

        if(instrucciones !== undefined){
            cuestionario.instrucciones = instrucciones;
        }

        if(tiempoLimite !== undefined){
            cuestionario.tiempoLimite = tiempoLimite;
        }

        if(nivel !== undefined){
            cuestionario.nivel = nivel;
        }

        if(typeof mostrarRevision === "boolean"){
            cuestionario.mostrarRevision = mostrarRevision;
        }

        if(typeof estado === "boolean"){
            cuestionario.estado = estado;
        }


        await cuestionario.save();


        res.json({

            msg:"Cuestionario actualizado correctamente",
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

export {
    crearCuestionario,
    obtenerCuestionarios,
    obtenerCuestionariosDisponibles,
    obtenerCuestionarioID,
    resolverCuestionario,
    actualizarCuestionario,
    eliminarCuestionario
};