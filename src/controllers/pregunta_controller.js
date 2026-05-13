import Pregunta from "../models/Pregunta.js";

const crearPregunta = async(req,res)=>{
    try {
        const { enunciado, tipoPregunta, opciones, respuestaCorrecta, explicacion, materia, tema, nivelDificultad, recursoApoyo } = req.body;
        // VALIDAR OPCIONES
        if((tipoPregunta === "opcion_multiple" || tipoPregunta === "verdadero_falso")
            && (!opciones || opciones.length < 2)){
            return res.status(400).json({
                msg:"La pregunta debe tener opciones válidas"
            });
        }

        // CREAR PREGUNTA
        const pregunta = new Pregunta({
            enunciado,
            tipoPregunta,
            opciones,
            respuestaCorrecta,
            explicacion,
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
const obtenerPreguntas = async(req,res)=>{
    try {
        const preguntas = await Pregunta.find()
        .populate("materia","nombre")
        .populate("tema","nombre")
        .select(`
            enunciado
            tipoPregunta
            opciones
            respuestaCorrecta
            nivelDificultad
            recursoApoyo
            estado
            createdAt
        `)
        .sort({createdAt:-1});

        res.json(preguntas);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener preguntas"
        });
    }
};
const obtenerPreguntaID = async(req,res)=>{
    try {
        const {id} = req.params;
        const pregunta = await Pregunta.findById(id)
        .populate("materia","nombre")
        .populate("tema","nombre");

        if(!pregunta){
            return res.status(404).json({
                msg:"Pregunta no encontrada"
            });
        }
        res.json(pregunta);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener pregunta"
        });
    }
};
const actualizarPregunta = async(req,res)=>{
    try {
        const {id} = req.params;
        const { enunciado, tipoPregunta, opciones, respuestaCorrecta, explicacion,
                materia, tema, nivelDificultad, recursoApoyo, estado } = req.body;

        const pregunta = await Pregunta.findById(id);

        if(!pregunta){
            return res.status(404).json({
                msg:"Pregunta no encontrada"
            });
        }
        if(( tipoPregunta === "opcion_multiple" || tipoPregunta === "verdadero_falso")
            && (!opciones || opciones.length < 2)){
            return res.status(400).json({
                msg:"La pregunta debe tener opciones válidas"
            });
        }

        pregunta.enunciado = enunciado || pregunta.enunciado;
        pregunta.tipoPregunta = tipoPregunta || pregunta.tipoPregunta;
        pregunta.opciones = opciones || pregunta.opciones;
        pregunta.respuestaCorrecta = respuestaCorrecta || pregunta.respuestaCorrecta;
        pregunta.explicacion = explicacion || pregunta.explicacion;
        pregunta.materia = materia || pregunta.materia;
        pregunta.tema = tema || pregunta.tema;
        pregunta.nivelDificultad = nivelDificultad || pregunta.nivelDificultad;
        pregunta.recursoApoyo = recursoApoyo || pregunta.recursoApoyo;

        if(typeof estado === "boolean"){
            pregunta.estado = estado;
        }
        await pregunta.save();
        res.json({
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
const eliminarPregunta = async(req,res)=>{
    try {
        const {id} = req.params;
        const pregunta = await Pregunta.findById(id);

        if(!pregunta){
            return res.status(404).json({
                msg:"Pregunta no encontrada"
            });
        }

        pregunta.estado = false;
        await pregunta.save();
        res.json({
            msg:"Pregunta eliminada correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al eliminar pregunta"
        });
    }
};

export { crearPregunta, obtenerPreguntas, obtenerPreguntaID, actualizarPregunta,
        eliminarPregunta
};