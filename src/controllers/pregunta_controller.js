import Pregunta from "../models/Pregunta.js";
import Materia from "../models/Materia.js";
import Tema from "../models/Tema.js";

// CREAR PREGUNTA
const crearPregunta = async(req,res)=>{
    try {
        const {
            enunciado,
            tipoPregunta,
            opciones,
            respuestaCorrecta,
            explicacion,
            materia,
            tema,
            nivelAcademico,
            nivelDificultad,
            recursoApoyo
        } = req.body;



        // VALIDAR CAMPOS OBLIGATORIOS
        if(
            !enunciado ||
            !tipoPregunta ||
            !respuestaCorrecta ||
            !materia ||
            !tema ||
            !nivelAcademico
        ){

            return res.status(400).json({
                msg:"Campos obligatorios incompletos"
            });

        }



        // VALIDAR MATERIA
        const materiaExiste = await Materia.findById(materia);

        if(!materiaExiste){

            return res.status(404).json({
                msg:"Materia no encontrada"
            });

        }



        // VALIDAR TEMA
        const temaExiste = await Tema.findById(tema)
        .populate("unidad")

        if(!temaExiste){

            return res.status(404).json({
                msg:"Tema no encontrado"
            });

        }



        // VALIDAR NIVEL ACADEMICO
        const nivelesValidos = [
            "1ro BGU",
            "2do BGU",
            "3ro BGU"
        ];

        if(!nivelesValidos.includes(nivelAcademico)){

            return res.status(400).json({
                msg:"Nivel académico inválido"
            });

        }



        // VALIDAR COINCIDENCIA DE NIVEL
        if(
            temaExiste.unidad.nivelAcademico !== nivelAcademico
        ){

            return res.status(400).json({
                msg:"El nivel académico no coincide con el tema"
            });

        }



        // OPCIONES
        let opcionesFinales = opciones || [];



        // VERDADERO / FALSO
        if(tipoPregunta === "verdadero_falso"){

            opcionesFinales = [
                { texto:"Verdadero" },
                { texto:"Falso" }
            ];

        }



        // RESPUESTA CORTA
        if(tipoPregunta === "respuesta_corta"){

            opcionesFinales = [];

        }



        // VALIDAR OPCIONES
        if(
            tipoPregunta === "opcion_multiple"
            ||
            tipoPregunta === "verdadero_falso"
        ){

            opcionesFinales = opcionesFinales.filter(
                (opcion)=>
                    opcion.texto?.trim() !== ""
            );

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



        // RECURSO APOYO
        let recursoFinal = undefined;

        if(
            recursoApoyo &&
            recursoApoyo.tipo &&
            recursoApoyo.tipo.trim() !== ""
        ){

            recursoFinal = recursoApoyo;

        }



        // VALIDAR RECURSO
        if(recursoFinal){

            const tiposUrl = [
                "imagen",
                "video",
                "pdf",
                "enlace"
            ];

            if(
                tiposUrl.includes(recursoFinal.tipo)
                &&
                !recursoFinal.url
            ){

                return res.status(400).json({
                    msg:"El recurso requiere URL"
                });

            }

            if(
                recursoFinal.tipo === "formula"
                &&
                !recursoFinal.contenido
            ){

                return res.status(400).json({
                    msg:"La fórmula requiere contenido"
                });

            }

        }



        // CREAR PREGUNTA
        const pregunta = new Pregunta({

            enunciado: enunciado.trim(),

            tipoPregunta,

            opciones: opcionesFinales,

            respuestaCorrecta:
                respuestaCorrecta.trim(),

            explicacion:
                explicacion?.trim() || "",

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



// OBTENER PREGUNTAS
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

            .sort({
                createdAt:-1
            });



        res.status(200).json(preguntas);

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



        res.status(200).json(pregunta);

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



        const {
            enunciado,
            tipoPregunta,
            opciones,
            respuestaCorrecta,
            explicacion,
            materia,
            tema,
            nivelAcademico,
            nivelDificultad,
            recursoApoyo,
            estado
        } = req.body;



        const tipoFinal =
            tipoPregunta || pregunta.tipoPregunta;



        let opcionesFinales =
            opciones || pregunta.opciones;



        // VERDADERO / FALSO
        if(tipoFinal === "verdadero_falso"){

            opcionesFinales = [
                { texto:"Verdadero" },
                { texto:"Falso" }
            ];

        }



        // RESPUESTA CORTA
        if(tipoFinal === "respuesta_corta"){

            opcionesFinales = [];

        }



        // VALIDAR OPCIONES
        if(
            tipoFinal === "opcion_multiple"
            ||
            tipoFinal === "verdadero_falso"
        ){

            opcionesFinales = opcionesFinales.filter(
                (opcion)=>
                    opcion.texto?.trim() !== ""
            );

            if(opcionesFinales.length < 2){

                return res.status(400).json({
                    msg:"La pregunta debe tener opciones válidas"
                });

            }



            const respuestaFinal =
                respuestaCorrecta
                ||
                pregunta.respuestaCorrecta;



            const existeRespuesta = opcionesFinales.some(
                (opcion)=>
                    opcion.texto.trim().toLowerCase()
                    ===
                    respuestaFinal.trim().toLowerCase()
            );



            if(!existeRespuesta){

                return res.status(400).json({
                    msg:"La respuesta correcta no existe en las opciones"
                });

            }

        }



        // ACTUALIZAR CAMPOS
        if(enunciado !== undefined){

            pregunta.enunciado =
                enunciado.trim();

        }

        if(tipoPregunta !== undefined){

            pregunta.tipoPregunta =
                tipoPregunta;

        }

        pregunta.opciones =
            opcionesFinales;



        if(respuestaCorrecta !== undefined){

            pregunta.respuestaCorrecta =
                respuestaCorrecta.trim();

        }

        if(explicacion !== undefined){

            pregunta.explicacion =
                explicacion.trim();

        }

        if(materia !== undefined){

            pregunta.materia =
                materia;

        }

        if(tema !== undefined){

            pregunta.tema =
                tema;

        }

        if(nivelDificultad !== undefined){

            pregunta.nivelDificultad =
                nivelDificultad;

        }



        // NIVEL ACADEMICO
        if(nivelAcademico !== undefined){

            const nivelesValidos = [
                "1ro BGU",
                "2do BGU",
                "3ro BGU"
            ];

            if(!nivelesValidos.includes(nivelAcademico)){

                return res.status(400).json({
                    msg:"Nivel académico inválido"
                });

            }

            pregunta.nivelAcademico =
                nivelAcademico;

        }



        // VALIDAR TEMA VS NIVEL
        const temaValidacion =
            await Tema.findById(
                pregunta.tema
            ).populate(
                "unidad",
                "nivelAcademico"
            );



        if(
            temaValidacion &&
            temaValidacion.unidad?.nivelAcademico
            !==
            pregunta.nivelAcademico
        ){

            return res.status(400).json({
                msg:"El nivel académico no coincide con el tema"
            });

        }



        // RECURSO APOYO
        if(recursoApoyo !== undefined){

            if(
                recursoApoyo.tipo &&
                recursoApoyo.tipo.trim() !== ""
            ){

                const tiposUrl = [
                    "imagen",
                    "video",
                    "pdf",
                    "enlace"
                ];

                if(
                    tiposUrl.includes(recursoApoyo.tipo)
                    &&
                    !recursoApoyo.url
                ){

                    return res.status(400).json({
                        msg:"El recurso requiere URL"
                    });

                }

                if(
                    recursoApoyo.tipo === "formula"
                    &&
                    !recursoApoyo.contenido
                ){

                    return res.status(400).json({
                        msg:"La fórmula requiere contenido"
                    });

                }

                pregunta.recursoApoyo =
                    recursoApoyo;

            } else {

                pregunta.recursoApoyo =
                    undefined;

            }

        }



        // ESTADO
        if(typeof estado === "boolean"){

            pregunta.estado =
                estado;

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



export {

    crearPregunta,

    obtenerPreguntas,

    obtenerPreguntaID,

    actualizarPregunta,

    cambiarEstadoPregunta

};