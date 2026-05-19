import Pregunta from "../models/Pregunta.js";
import Materia from "../models/Materia.js";
import Tema from "../models/Tema.js";


// Crear nueva pregunta para evaluacion
const crearPregunta = async(req,res)=>{
    try {
        const { enunciado,  tipoPregunta, opciones, respuestaCorrecta, explicacion, materia,
                tema, nivelAcademico, nivelDificultad, recursoApoyo } = req.body;

        if( !enunciado || !tipoPregunta || !respuestaCorrecta || 
            !materia || !tema || !nivelAcademico ){
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
        if(temaExiste.nivelAcademico !== nivelAcademico){
            return res.status(400).json({
                msg:"El nivel academico no coincide con el tema"
            });
        }
        const nivelesValidos = [ "1ro BGU", "2do BGU", "3ro BGU"];
        if(!nivelesValidos.includes(nivelAcademico)){
            return res.status(400).json({
                msg:"Nivel academico invalido"
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
            const existeRespuesta = opcionesFinales.some(
                (opcion)=>
                    opcion.texto.trim().toLowerCase()
                    ===
                    respuestaCorrecta.trim().toLowerCase()
            );
            if(!existeRespuesta){
                return res.status(400).json({
                    msg:"La respuesta correcta no existe en las opciones"
                });
            }
        }
        let recursoFinal = undefined;
        if( recursoApoyo && recursoApoyo.tipo && recursoApoyo.tipo.trim() !== ""){
            recursoFinal = recursoApoyo;
        }
        const pregunta = new Pregunta({
            enunciado: enunciado.trim(),
            tipoPregunta,
            opciones: opcionesFinales,
            respuestaCorrecta: respuestaCorrecta.trim(),
            explicacion: explicacion?.trim() || "",
            materia,
            tema,
            nivelAcademico,
            nivelDificultad,
            recursoApoyo: recursoFinal
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
                tema, nivelAcademico, nivelDificultad, recursoApoyo, estado } = req.body;

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
            if(respuestaCorrecta){
                const existeRespuesta = opcionesFinales.some(
                    (opcion)=>
                        opcion.texto.trim().toLowerCase()
                        ===
                        respuestaCorrecta.trim().toLowerCase()
                    );
                if(!existeRespuesta){
                    return res.status(400).json({
                        msg:"La respuesta correcta no existe en las opciones"
                    });
    }
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
        if(nivelAcademico !== undefined){
            const nivelesValidos = ["1ro BGU", "2do BGU", "3ro BGU"];
            if(!nivelesValidos.includes(nivelAcademico)){
                return res.status(400).json({
                    msg:"El nivel academico es invalido"
                });
            }
            pregunta.nivelAcademico = nivelAcademico;
        }
        
        //Validar que concuerden el año escolar de la pregunta con el año escolar del tema
        const temaValidacion = await Tema.findById(pregunta.tema);
        if(temaValidacion && temaValidacion.nivelAcademico !== pregunta.nivelAcademico){
            return res.status(400).json({
                msg:"El nivel academico no coincide con el tema"
            })
        }
        if(recursoApoyo !== undefined){
            if(recursoApoyo.tipo &&
                recursoApoyo.tipo.trim !==""
            ){
                pregunta.recursoApoyo = recursoApoyo;
            }else{
                pregunta.recursoApoyo = undefined;
            }
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