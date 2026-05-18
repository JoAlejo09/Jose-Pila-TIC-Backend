import Pregunta from "../models/Pregunta.js";
import Materia from "../models/Materia.js";
import Tema from "../models/Tema.js";


// Crear nueva pregunta para evaluacion
const crearPregunta = async(req,res)=>{
    try {
        const { enunciado,  tipoPregunta, opciones, respuestaCorrecta, explicacion, materia,
                tema, nivelDificultad, recursoApoyo } = req.body;

        if( !enunciado || !tipoPregunta || !respuestaCorrecta || !materia || !tema ){
            return res.status(400).json({
                msg:"Campos obligatorios incompletos"
            });
        }
        
        const materiaExiste = await Materia.findById(materia);

        if(!materiaExiste){
            return res.status(404).json({
                msg:"Materia no encontrada"
            });
        }

        const temaExiste = await Tema.findById(tema);

        if(!temaExiste){
            return res.status(404).json({
                msg:"Tema no encontrado"
            });
        }

        let opcionesFinales = opciones || [];

        if(tipoPregunta === "verdadero_falso"){
            opcionesFinales = [ "Verdadero", "Falso" ];
        }
        if( tipoPregunta === "opcion_multiple" || tipoPregunta === "verdadero_falso"){
            if(opcionesFinales.length < 2){
                return res.status(400).json({
                    msg:"La pregunta debe tener mínimo 2 opciones"
                });
            }
            if( !opcionesFinales.includes( respuestaCorrecta ) ){
                return res.status(400).json({
                    msg:"La respuesta correcta no existe en las opciones"
                });
            }
        }

        const pregunta = new Pregunta({
            enunciado: enunciado.trim(),
            tipoPregunta,
            opciones: opcionesFinales,
            respuestaCorrecta: respuestaCorrecta.trim(),
            explicacion: explicacion?.trim() || "",
            materia,
            tema,
            nivelDificultad,
            recursoApoyo
        });

        await pregunta.save();
        res.status(201).json({
            msg:"Pregunta creada correctamente",
            pregunta
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al crear pregunta"
        });
    }
};

// Obtener preguntas
const obtenerPreguntas = async(req,res)=>{
    try {
        const preguntas = await Pregunta.find()
        .populate(
            "materia",
            "nombre"
        )
        .populate(
            "tema",
            "nombre"
        )
        .sort({ createdAt:-1 });

        res.status(200).json( preguntas);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener preguntas"
        });
    }
};

// OBTENER PREGUNTA POR ID
const obtenerPreguntaID = async(req,res)=>{
    try {
        const {id} = req.params;

        const pregunta = await Pregunta.findById(id)
            .populate(
                "materia",
                "nombre"
            )
            .populate(
                "tema",
                "nombre"
            );

        if(!pregunta){
            return res.status(404).json({
                msg:"Pregunta no encontrada"
            });
        }

        res.status(200).json( pregunta );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener pregunta"
        });
    }
};

// ACTUALIZAR PREGUNTA
const actualizarPregunta = async(req,res)=>{
    try {
        const {id} = req.params;

        const pregunta = await Pregunta.findById(id);

        if(!pregunta){
            return res.status(404).json({
                msg:"Pregunta no encontrada"
            });
        }

        const { enunciado, tipoPregunta, opciones, respuestaCorrecta, explicacion, materia,
                tema, nivelDificultad, recursoApoyo, estado } = req.body;

        let opcionesFinales = opciones || pregunta.opciones;

        if(tipoPregunta === "verdadero_falso"){
            opcionesFinales = ["Verdadero", "Falso"];
        }

        if( tipoPregunta === "opcion_multiple" || tipoPregunta === "verdadero_falso"){
            if(opcionesFinales.length < 2){
                return res.status(400).json({
                    msg:"La pregunta debe tener opciones válidas"
                });
            }
            if( respuestaCorrecta && !opcionesFinales.includes( respuestaCorrecta)){
                return res.status(400).json({
                    msg:"La respuesta correcta no existe en las opciones"
                });
            }
        }

        if(enunciado !== undefined){
            pregunta.enunciado = enunciado.trim();
        }
        if(tipoPregunta !== undefined){
            pregunta.tipoPregunta = tipoPregunta;
        }
        pregunta.opciones = opcionesFinales;
        if(respuestaCorrecta !== undefined){
            pregunta.respuestaCorrecta = respuestaCorrecta.trim();
        }
        if(explicacion !== undefined){
            pregunta.explicacion = explicacion.trim();
        }
        if(materia !== undefined){
            pregunta.materia = materia;
        }
        if(tema !== undefined){
            pregunta.tema = tema;
        }
        if(nivelDificultad !== undefined){
            pregunta.nivelDificultad = nivelDificultad;
        }
        if(recursoApoyo !== undefined){
            pregunta.recursoApoyo = recursoApoyo;
        }
        if(typeof estado === "boolean"){
            pregunta.estado = estado;
        }

        await pregunta.save();
        res.status(200).json({
            msg:"Pregunta actualizada correctamente",
            pregunta
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al actualizar pregunta"
        });
    }
};

// CAMBIAR ESTADO
const cambiarEstadoPregunta = async(req,res)=>{
    try {
        const {id} = req.params;

        const pregunta = await Pregunta.findById(id);

        if(!pregunta){
            return res.status(404).json({
                msg:"Pregunta no encontrada"
            });
        }
        pregunta.estado = !pregunta.estado;

        await pregunta.save();

        res.status(200).json({
            msg:`Pregunta ${
                pregunta.estado
                ? "activada"
                : "desactivada"
            } correctamente`,
            pregunta
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al cambiar estado"
        });
    }
};

export { crearPregunta, obtenerPreguntas, obtenerPreguntaID, actualizarPregunta, cambiarEstadoPregunta };