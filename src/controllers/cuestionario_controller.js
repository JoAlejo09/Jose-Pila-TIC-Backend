// El usuario pueda crear un cuestionario/evaluacion

import Cuestionario from "../models/Cuestionario.js";
import Pregunta from "../models/Pregunta.js";
import Resultado from "../models/Resultado.js";
import Estudiante from "../models/Estudiante.js";
import Tema from "../models/Tema.js";


// ============================================
// CREAR CUESTIONARIO
// ============================================
const crearCuestionario = async(req,res)=>{

    try {

        let {
            titulo,
            descripcion,
            instrucciones,
            materia,
            tema,
            nivelAcademico,
            tipoEvaluacion,
            tipoCuestionario,
            modoGeneracion,
            preguntas,
            cantidadPreguntas,
            tiempoLimite,
            nivel,
            aleatorio,
            mostrarRevision,
            mostrarRespuestasCorrectas,
            permitirReintento
        } = req.body;


        // ============================================
        // VALIDAR CAMPOS OBLIGATORIOS
        // ============================================
        if(
            !titulo ||
            !materia ||
            !tipoEvaluacion ||
            !modoGeneracion ||
            !cantidadPreguntas ||
            !nivelAcademico
        ){
            return res.status(400).json({
                msg:"Campos obligatorios"
            });
        }


        // ============================================
        // VALIDAR NIVEL ACADEMICO
        // ============================================
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


        // ============================================
        // SI ES EVALUACION GENERAL DE MATERIA
        // ============================================
        if(tipoEvaluacion === "materia"){
            tema = null;
        }


        // ============================================
        // VALIDAR TEMA
        // ============================================
        if(tipoEvaluacion === "tema"){

            if(!tema){
                return res.status(400).json({
                    msg:"Debe seleccionar un tema"
                });
            }

            const temaExiste = await Tema.findById(tema);

            if(!temaExiste){
                return res.status(404).json({
                    msg:"Tema no encontrado"
                });
            }

            if(
                temaExiste.materia.toString()
                !==
                materia.toString()
            ){
                return res.status(400).json({
                    msg:"El tema no pertenece a la materia"
                });
            }

            if(
                temaExiste.nivelAcademico
                !==
                nivelAcademico
            ){
                return res.status(400).json({
                    msg:"El nivel académico no coincide con el tema"
                });
            }
        }


        // ============================================
        // NIVEL FINAL
        // ============================================
        const nivelFinal = nivel || "medio";


        // ============================================
        // PREGUNTAS SELECCIONADAS
        // ============================================
        let preguntasSeleccionadas = [];


        // ============================================
        // GENERACION MANUAL
        // ============================================
        if(modoGeneracion === "manual"){

            if(!preguntas || preguntas.length === 0){
                return res.status(400).json({
                    msg:"Debe seleccionar preguntas"
                });
            }

            const filtroPreguntas = {
                _id:{ $in:preguntas },
                estado:true,
                materia,
                nivelAcademico
            };

            if(tipoEvaluacion === "tema"){
                filtroPreguntas.tema = tema;
            }

            const preguntasDB = await Pregunta.find(
                filtroPreguntas
            );

            if(
                preguntasDB.length !== preguntas.length
            ){
                return res.status(400).json({
                    msg:"Existen preguntas inválidas"
                });
            }

            preguntasSeleccionadas =
                preguntasDB.map(
                    pregunta => pregunta._id
                );

            if(
                preguntasSeleccionadas.length
                !==
                Number(cantidadPreguntas)
            ){
                return res.status(400).json({
                    msg:"La cantidad de preguntas no coincide"
                });
            }
        }


        // ============================================
        // GENERACION DINAMICA
        // ============================================
        if(modoGeneracion === "dinamico"){

            const filtroPreguntas = {
                materia,
                estado:true,
                nivelAcademico,
                nivelDificultad:nivelFinal
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

            if(
                preguntasDB.length
                <
                Number(cantidadPreguntas)
            ){
                return res.status(400).json({
                    msg:`Solo existen ${preguntasDB.length} preguntas disponibles`
                });
            }

            preguntasSeleccionadas =
                preguntasDB.map(
                    pregunta => pregunta._id
                );
        }


        // ============================================
        // CREAR CUESTIONARIO
        // ============================================
        const cuestionario = new Cuestionario({

            titulo:titulo.trim(),

            descripcion:
                descripcion?.trim() || "",

            instrucciones:
                instrucciones?.trim() || "",

            materia,

            tema:
                tipoEvaluacion === "tema"
                ? tema
                : null,

            nivelAcademico,

            tipoEvaluacion,

            tipoCuestionario:
                tipoCuestionario || "practica",

            modoGeneracion,

            preguntas:preguntasSeleccionadas,

            cantidadPreguntas:
                Number(cantidadPreguntas),

            tiempoLimite:
                tiempoLimite || 30,

            nivel:nivelFinal,

            aleatorio:
                aleatorio || false,

            mostrarRevision:
                mostrarRevision ?? true,

            mostrarRespuestasCorrectas:
                mostrarRespuestasCorrectas ?? true,

            permitirReintento:
                permitirReintento || false
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


// ============================================
// OBTENER CUESTIONARIOS
// ============================================
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


// ============================================
// CUESTIONARIOS DISPONIBLES
// ============================================
const obtenerCuestionariosDisponibles = async(req,res)=>{

    try {

        const estudiante = await Estudiante.findOne({
            usuario:req.usuario._id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil Estudiante no encontrado"
            });
        }

        const cuestionarios = await Cuestionario.find({
            estado:true,
            nivelAcademico:
                estudiante.nivelAcademico
        })
        .populate("materia","nombre")
        .populate("tema","nombre")
        .select(`
            titulo
            descripcion
            instrucciones
            tipoEvaluacion
            tipoCuestionario
            cantidadPreguntas
            tiempoLimite
            nivel
            nivelAcademico
            createdAt
        `)
        .sort({createdAt:-1});

        res.json(cuestionarios);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al obtener los cuestionarios disponibles"
        });
    }
};


// ============================================
// OBTENER CUESTIONARIO ADMIN
// ============================================
const obtenerCuestionarioAdminID = async(req,res)=>{

    try {

        const {id} = req.params;

        const cuestionario = await Cuestionario.findById(id)
        .populate("materia","nombre")
        .populate("tema","nombre")
        .populate({
            path:"preguntas"
        });

        if(!cuestionario){
            return res.status(404).json({
                msg:"Cuestionario no encontrado"
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


// ============================================
// OBTENER CUESTIONARIO PARA RESOLVER
// ============================================
const obtenerCuestionarioResolver = async(req,res)=>{

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

        if(cuestionario.aleatorio){
            cuestionario.preguntas.sort(
                ()=> Math.random() - 0.5
            );
        }

        const estudiante = await Estudiante.findOne({
            usuario:req.usuario._id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        if(
            cuestionario.nivelAcademico
            !==
            estudiante.nivelAcademico
        ){
            return res.status(403).json({
                msg:"El cuestionario no corresponde a su año academico"
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


// ============================================
// RESOLVER CUESTIONARIO
// ============================================
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

        const estudiante = await Estudiante.findOne({
            usuario:req.usuario._id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil de estudiante no encontrado"
            });
        }

        if(
            cuestionario.nivelAcademico
            !==
            estudiante.nivelAcademico
        ){
            return res.status(403).json({
                msg:"El cuestionario no corresponde a su año academico"
            });
        }

        if(
            tiempoEmpleado >
            cuestionario.tiempoLimite * 60
        ){
            return res.status(400).json({
                msg:"Tiempo excedido"
            });
        }

        const resultadoExistente =
            await Resultado.findOne({
                estudiante:req.usuario._id,
                cuestionario:id
            });

        if(
            resultadoExistente &&
            !cuestionario.permitirReintento
        ){
            return res.status(400).json({
                msg:"Ya resolviste este cuestionario"
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

            if(!respuestaUsuario){

                sinResponder++;

            }else if(

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

            }else{

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
                (
                    correctas /
                    cuestionario.preguntas.length
                ) * 100
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
                ? detalleRespuestas.map((r)=>({
                    ...r,
                    respuestaCorrecta:
                        cuestionario
                            .mostrarRespuestasCorrectas
                        ? r.respuestaCorrecta
                        : undefined
                }))
                : []
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al resolver cuestionario"
        });
    }
};


// ============================================
// ACTUALIZAR CUESTIONARIO
// ============================================
const actualizarCuestionario = async(req,res)=>{

    try {

        const {id} = req.params;

        const cuestionario =
            await Cuestionario.findById(id);

        if(!cuestionario){
            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });
        }

        const camposPermitidos = [
            "titulo",
            "descripcion",
            "instrucciones",
            "tiempoLimite",
            "nivel",
            "aleatorio",
            "mostrarRevision",
            "mostrarRespuestasCorrectas",
            "permitirReintento",
            "estado"
        ];

        camposPermitidos.forEach((campo)=>{

            if(req.body[campo] !== undefined){
                cuestionario[campo] =
                    req.body[campo];
            }
        });

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

// ============================================
// CAMBIAR ESTADO CUESTIONARIO
// ============================================
const eliminarCuestionario = async(req,res)=>{

    try {

        const { id } = req.params;

        const cuestionario =
            await Cuestionario.findById(id);

        if(!cuestionario){
            return res.status(404).json({
                msg:"Cuestionario no encontrado"
            });
        }

        // TOGGLE ESTADO
        cuestionario.estado =
            !cuestionario.estado;

        await cuestionario.save();

        res.json({
            msg:`Cuestionario ${
                cuestionario.estado
                ? "activado"
                : "desactivado"
            } correctamente`,
            cuestionario
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al cambiar estado del cuestionario"
        });
    }
};


export {
    crearCuestionario,
    obtenerCuestionarios,
    obtenerCuestionariosDisponibles,
    obtenerCuestionarioAdminID,
    obtenerCuestionarioResolver,
    resolverCuestionario,
    actualizarCuestionario,
    eliminarCuestionario
};