import Cuestionario from "../models/Cuestionario.js";
import Pregunta from "../models/Pregunta.js";
import Resultado from "../models/Resultado.js";
import Estudiante from "../models/Estudiante.js";
import Tema from "../models/Tema.js";
import Materia from "../models/Materia.js";
import ResultadoDiagnostico from "../models/ResultadoDiagnostico.js";
import mongoose from "mongoose";
import { actualizarProgresoAcademico } from "./progresoacademico_controller.js";
import { actualizarAnalisisAcademico } from "./recomendacion_controller.js";
import { generarRecomendacionEstudiante } from "./recomendacion_controller.js";

//Para crear un cuestionario para evaluar a un estudiante
const crearCuestionario = async (req, res) => {
    try {
        let {
            titulo,
            descripcion,
            instrucciones,
            materia,
            tema,
            nivelAcademico,
            alcanceEvaluacion,
            tipoEvaluacion,
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

        // VALIDACIONES GENERALES
        if (
            !titulo ||
            !materia ||
            !nivelAcademico ||
            !alcanceEvaluacion ||
            !tipoEvaluacion ||
            !modoGeneracion ||
            !cantidadPreguntas
        ) {
            return res.status(400).json({
                msg: "Debe completar todos los campos obligatorios"
            });
        }

        // VALIDAR OBJECT ID
        if (!mongoose.Types.ObjectId.isValid(materia)) {
            return res.status(400).json({
                msg: "Materia inválida"
            });
        }

        if (tema && !mongoose.Types.ObjectId.isValid(tema)) {
            return res.status(400).json({
                msg: "Tema inválido"
            });
        }

        // VALIDAR TÍTULO
        if (titulo.trim().length < 3) {
            return res.status(400).json({
                msg: "El título debe tener al menos 3 caracteres"
            });
        }

        // VALIDAR CANTIDAD DE PREGUNTAS
        const cantidad = Number(cantidadPreguntas);
        if (
            !Number.isInteger(cantidad)||
            isNaN(cantidadPreguntas) ||
            Number(cantidadPreguntas) <= 0
        ) {
            return res.status(400).json({
                msg: "La cantidad de preguntas debe ser entero y mayor a 0"
            });
        }

        // VALIDAR TIEMPO LÍMITE
        if (
            tiempoLimite &&
            Number(tiempoLimite) <= 0
        ) {
            return res.status(400).json({
                msg: "El tiempo límite debe ser mayor a cero"
            });
        }

        const nivelesValidos = [
            "1ro BGU",
            "2do BGU",
            "3ro BGU"
        ];

        if (!nivelesValidos.includes(nivelAcademico)) {
            return res.status(400).json({
                msg: "Nivel académico inválido"
            });
        }

        const tiposEvaluacion = [
            "diagnostico",
            "refuerzo"
        ];

        if (!tiposEvaluacion.includes(tipoEvaluacion)) {
            return res.status(400).json({
                msg: "Tipo de evaluación inválido"
            });
        }

        const modosValidos = [
            "manual",
            "dinamico"
        ];

        if (!modosValidos.includes(modoGeneracion)) {
            return res.status(400).json({
                msg: "Modo de generación inválido"
            });
        }

        const alcancesValidos = [
            "materia",
            "tema"
        ];

        if (!alcancesValidos.includes(alcanceEvaluacion)) {
            return res.status(400).json({
                msg: "Alcance inválido"
            });
        }

        // VALIDAR EXISTENCIA DE MATERIA
        const materiaExiste = await Materia.findById(materia);

        if (!materiaExiste) {
            return res.status(404).json({
                msg: "Materia no encontrada"
            });
        }
        if(!materiaExiste.estado){
            return res.status(400).json({
                msg:"La materia esta desactivada. No se puede usar."
            })
        }

        // SI ES EVALUACIÓN POR MATERIA
        if (alcanceEvaluacion === "materia") {
            tema = null;
        }

        // SI ES EVALUACIÓN POR TEMA
        if (alcanceEvaluacion === "tema") {

            if (!tema) {
                return res.status(400).json({
                    msg: "Debe seleccionar un tema"
                });
            }

            const temaExiste = await Tema.findById(tema);

            if (!temaExiste) {
                return res.status(404).json({
                    msg: "Tema no encontrado"
                });
            }
            if(!temaExiste.estado){
                return res.status(400).json({
                    msg:"El tema esta desactivado. No se puede usar"
                })
            }

            if (
                temaExiste.materia.toString() !==
                materia.toString()
            ) {
                return res.status(400).json({
                    msg: "El tema no pertenece a la materia"
                });
            }

            if (
                temaExiste.nivelAcademico !==
                nivelAcademico
            ) {
                return res.status(400).json({
                    msg: "Nivel académico incorrecto"
                });
            }
        }

        // VALIDAR DIFICULTAD
        const nivelesDificultad = [
            "facil",
            "medio",
            "dificil"
        ];

        const nivelFinal = nivel || "medio";

        if (
            modoGeneracion === "dinamico" &&
            !nivelesDificultad.includes(nivelFinal)
        ) {
            return res.status(400).json({
                msg: "Nivel de dificultad inválido"
            });
        }

        let preguntasSeleccionadas = [];

        // GENERACIÓN MANUAL
        if (modoGeneracion === "manual") {

            if (!preguntas || preguntas.length === 0) {
                return res.status(400).json({
                    msg: "Debe seleccionar preguntas"
                });
            }

            const filtroPreguntas = {
                _id: { $in: preguntas },
                estado: true,
                materia,
                nivelAcademico
            };

            if (alcanceEvaluacion === "tema") {
                filtroPreguntas.tema = tema;
            }

            const preguntasDB = await Pregunta.find(
                filtroPreguntas
            );

            if (
                preguntasDB.length !== preguntas.length
            ) {
                return res.status(400).json({
                    msg: "Existen preguntas inválidas"
                });
            }

            preguntasSeleccionadas = preguntasDB.map(
                pregunta => pregunta._id
            );

            if (
                preguntasSeleccionadas.length !==
                Number(cantidadPreguntas)
            ) {
                return res.status(400).json({
                    msg: "Cantidad de preguntas incorrecta"
                });
            }
        }

        // GENERACIÓN DINÁMICA
        if (modoGeneracion === "dinamico") {

            const filtroPreguntas = {
                materia: new mongoose.Types.ObjectId(materia),
                estado: true,
                nivelAcademico,
                nivelDificultad: nivelFinal
            };

            if (alcanceEvaluacion === "tema") {
                filtroPreguntas.tema =
                    new mongoose.Types.ObjectId(tema);
            }

            const preguntasDB = await Pregunta.aggregate([
                {
                    $match: filtroPreguntas
                },
                {
                    $sample: {
                        size: Number(cantidadPreguntas)
                    }
                }
            ]);

            if (
                preguntasDB.length <
                Number(cantidadPreguntas)
            ) {
                return res.status(400).json({
                    msg: `Solo existen ${preguntasDB.length} preguntas disponibles`
                });
            }

            preguntasSeleccionadas = preguntasDB.map(
                pregunta => pregunta._id
            );
        }

        // CREAR CUESTIONARIO
        const cuestionario = new Cuestionario({
            titulo: titulo.trim(),
            descripcion: descripcion?.trim() || "",
            instrucciones: instrucciones?.trim() || "",
            materia,
            tema:
                alcanceEvaluacion === "tema"
                    ? tema
                    : null,
            nivelAcademico,
            alcanceEvaluacion,
            tipoEvaluacion,
            modoGeneracion,
            preguntas: preguntasSeleccionadas,

            cantidadPreguntas: Number(cantidadPreguntas),
            tiempoLimite: Number(tiempoLimite) || 30,
            nivel: nivelFinal,
            aleatorio: aleatorio || false,
            mostrarRevision: mostrarRevision ?? true,
            mostrarRespuestasCorrectas:
                mostrarRespuestasCorrectas ?? true,
            permitirReintento:
                permitirReintento || false
        });

        await cuestionario.save();

        return res.status(201).json({
            msg: "Cuestionario creado correctamente",
            cuestionario
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: "Error al crear cuestionario"
        });
    }
};

//Para el admin se muestra los cuestionarios para la gestion CRUD de estos
const obtenerCuestionarios = async (req, res) => {
    try {

        const cuestionarios = await Cuestionario.find()
                .populate("materia", "nombre")
                .populate("tema", "nombre")
                .sort({ createdAt: -1 })
                .lean();

        console.log(cuestionarios[0])
        res.json(cuestionarios);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener cuestionarios"
        });
    }
};

//Para el estudiante se le muestra los cuestionarios que puede resolver
//acorde a si estan disponibles
const obtenerCuestionariosDisponibles = async (req, res) => {
    try {
        const estudiante = await Estudiante.findOne({
            usuario: req.usuario.id
        });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const cuestionarios = await Cuestionario.find({
            estado: true,
            nivelAcademico: estudiante.nivelAcademico
            })
            .populate("materia", "nombre")
            .populate("tema", "nombre")
            .sort({ createdAt: -1 });

        res.json(cuestionarios);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener cuestionarios"
        });
    }
};

//Para admin Obtener un cuestionario para editarlo
const obtenerCuestionarioAdminID = async (req, res) => {
    try {
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                msg:"ID de cuestionario inválido"
            });
        }

        const cuestionario = await Cuestionario.findById(id)
            .populate("materia", "nombre")
            .populate("tema", "nombre")
            .populate("preguntas");

        if (!cuestionario) {
            return res.status(404).json({
                msg: "Cuestionario no encontrado"
            });
        }

        res.json(cuestionario);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener cuestionario"
        });
    }
};

//Para estudiante una vez seleccionado el cuestionario se da paso a resolverlo
const obtenerCuestionarioResolver = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                msg:"ID de cuestionario inválido"
            });
        }

        const cuestionario = await Cuestionario.findById(id)
            .populate("materia", "nombre")
            .populate("tema", "nombre")
            .populate({
                path: "preguntas",
                select: ` enunciado tipoPregunta opciones recursoApoyo nivelDificultad `
                });

        if (!cuestionario) {
            return res.status(404).json({
                msg: "Cuestionario no encontrado"
            });
        }

        if (!cuestionario.estado) {
            return res.status(400).json({
                msg: "Cuestionario no disponible"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: req.usuario.id
        });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        if ( cuestionario.nivelAcademico !== estudiante.nivelAcademico ) {
            return res.status(403).json({
                msg: "No pertenece a tu nivel académico"
            });
        }

        if (cuestionario.aleatorio) {
            cuestionario.preguntas.sort(
                () => Math.random() - 0.5
            );
        }

        res.status(200).json(cuestionario);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener cuestionario"
        });
    }
};

//Verifica que estudiante haya rendido evaluacion diagnostica de una materia
const verificarDiagnosticoMateria = async (req, res) => {
    try {
        const { materiaId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(materiaId)){
            return res.status(400).json({
                msg:"ID de materia inválido"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: req.usuario.id
        });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const cuestionarioDiagnostico =
            await Cuestionario.findOne({
                materia: materiaId,
                tipoEvaluacion: "diagnostico",
                alcanceEvaluacion: "materia",
                nivelAcademico: estudiante.nivelAcademico,
                estado: true
            });

        if (!cuestionarioDiagnostico) {
            return res.status(404).json({
                msg: "No existe evaluación diagnóstica"
            });
        }

        const resultadoExistente = await Resultado.findOne({
                estudiante: estudiante._id,
                cuestionario: cuestionarioDiagnostico._id
            });

        if (resultadoExistente) {
            return res.json({ tieneDiagnostico: true });
        }

        res.status(200).json({
            tieneDiagnostico: false,
            cuestionarioId: cuestionarioDiagnostico._id
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al verificar diagnóstico"
        });
    }
};

//Recibe el cuestionario resuelto por parte del estudiante para almacenarlo,
// registrarlo en progreso, realizar analisis y generar recomendaciones.
const resolverCuestionario = async (req, res) => {

    try {

        const { id } = req.params;

        const { respuestas, tiempoEmpleado } = req.body;

        if (!respuestas || respuestas.length === 0) {
            return res.status(400).json({
                msg: "Debe enviar respuestas"
            });
        }

        const cuestionario = await Cuestionario.findById(id)
            .populate("preguntas");

        if (!cuestionario) {
            return res.status(404).json({
                msg: "Cuestionario no encontrado"
            });
        }

        if (!cuestionario.estado) {

            return res.status(400).json({
                msg: "Cuestionario no disponible"
            });
        }

        if (cuestionario.preguntas.length === 0) {
            return res.status(400).json({
                msg: "El cuestionario no tiene preguntas"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: req.usuario.id
        });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        if ( cuestionario.nivelAcademico !== estudiante.nivelAcademico ) {
            return res.status(403).json({
                msg: "Nivel académico incorrecto"
            });
        }

        // VALIDAR TIEMPO
        if ( tiempoEmpleado > cuestionario.tiempoLimite * 60 ) {
            return res.status(400).json({
                msg: "Tiempo excedido"
            });
        }

        // VALIDAR REINTENTO
        const resultadoExistente = await Resultado.findOne({
            estudiante: estudiante.usuario,
            cuestionario: id
        });

        if ( resultadoExistente && !cuestionario.permitirReintento ) {
            return res.status(400).json({
                msg: "Ya resolviste este cuestionario"
            });
        }

        // NORMALIZAR RESPUESTAS
        const normalizar = (texto) =>
            texto?.toString().trim().toLowerCase();

        // VARIABLES RESULTADO
        let correctas = 0;
        let incorrectas = 0;
        let sinResponder = 0;

        const detalleRespuestas = [];
        const temasMap = {};

        // RECORRER PREGUNTAS
        for (const pregunta of cuestionario.preguntas) {
            const respuestaEncontrada = respuestas.find(
                (r) =>
                    r.pregunta ===
                    pregunta._id.toString()
            );

            const respuestaUsuario = respuestaEncontrada?.respuestaUsuario || "";

            let esCorrecta = false;

            const temaId = pregunta.tema?.toString();

            // CREAR TEMA EN MAPA
            if (temaId && !temasMap[temaId]) {
                temasMap[temaId] = {
                    tema: pregunta.tema,
                    correctas: 0,
                    incorrectas: 0
                };
            }

            // SIN RESPONDER
            if (!respuestaUsuario) {
                sinResponder++;
                if (temaId) {
                    temasMap[temaId].incorrectas++;
                }
            }

            // RESPUESTA CORRECTA
            else if ( normalizar(respuestaUsuario) === normalizar(pregunta.respuestaCorrecta)
            ) {
                correctas++;
                esCorrecta = true;
                if (temaId) {
                    temasMap[temaId].correctas++;
                }
            }

            // RESPUESTA INCORRECTA
            else {
                incorrectas++;
                if (temaId) {
                    temasMap[temaId].incorrectas++;
                }
            }

            // DETALLE RESPUESTA
            detalleRespuestas.push({
                pregunta: pregunta._id,
                tema: pregunta.tema,
                respuestaUsuario,
                respuestaCorrecta: pregunta.respuestaCorrecta,
                esCorrecta,
                explicacion:
                    pregunta.explicacion || ""
            });
        }

        // ANALÍTICA POR TEMAS

        const temasFuertes = [];
        const temasDebiles = [];

        Object.values(temasMap).forEach((tema) => {
            if ( tema.incorrectas >= tema.correctas ) {
                temasDebiles.push({
                    tema: tema.tema,
                    incorrectas: tema.incorrectas
                });

            } else {
                temasFuertes.push({
                    tema: tema.tema,
                    correctas: tema.correctas
                });
            }
        });

        // PORCENTAJE
        const porcentaje = Number(
            (
                (
                    correctas /
                    cuestionario.preguntas.length
                ) * 100
            ).toFixed(1)
        );

        // APROBADO
        const aprobado = porcentaje >= 70;

        // NIVEL RESULTADO

        let nivelResultado = "";
        if (porcentaje < 50) {
            nivelResultado = "bajo";
        } else if (porcentaje < 80) {
            nivelResultado = "medio";
        } else {
            nivelResultado = "alto";
        }
        // GUARDAR RESULTADO

        const resultado = new Resultado({
            estudiante: estudiante._id,
            cuestionario: id,
            materia: cuestionario.materia,
            respuestas: detalleRespuestas,
            correctas,
            incorrectas,
            sinResponder,
            puntaje: correctas,
            porcentaje,
            nivelResultado,
            aprobado,
            tiempoEmpleado,
            temasDebiles,
            temasFuertes
        });

        await resultado.save();

        // ACTUALIZAR PROGRESO
        await actualizarProgresoAcademico({
            estudianteId: estudiante._id,
            tipoEvaluacion: cuestionario.tipoEvaluacion,
            porcentaje,
            aprobado,
            tiempoEmpleado,
            temasFuertes,
            temasDebiles
        });

        // PREPARAR TEMAS PARA ANALÍTICA
        const temasAnalisis = [
            ...temasFuertes.map((tema) => ({
                tema: tema.tema,
                correctas: tema.correctas || 0,
                incorrectas: 0
            })),

            ...temasDebiles.map((tema) => ({
                tema: tema.tema,
                correctas: 0,
                incorrectas: tema.incorrectas || 0
            }))
        ];

        // ACTUALIZAR ANALÍTICA

        await actualizarAnalisisAcademico({
            estudianteId: estudiante._id,
            cuestionarioId: cuestionario._id,
            materiaId: cuestionario.materia,
            temas: temasAnalisis
        });

        // GENERAR RECOMENDACIONES

        await generarRecomendacionEstudiante( estudiante._id );

        // RESULTADO DIAGNÓSTICO

        if ( cuestionario.tipoEvaluacion === "diagnostico" ) {
            const diagnosticoExiste = await ResultadoDiagnostico.findOne({
                    estudiante: estudiante._id,
                    materia: cuestionario.materia
                });

            if (!diagnosticoExiste) {
                await ResultadoDiagnostico.create({
                    estudiante: estudiante._id,
                    materia: cuestionario.materia,
                    cuestionario: cuestionario._id,
                    puntaje: porcentaje,
                    nivelResultado,
                    aprobado
                });
            }
        }

        return res.json({
            msg: "Cuestionario resuelto correctamente",
            resultado: {
                _id: resultado._id,
                correctas,
                incorrectas,
                sinResponder,
                puntaje: correctas,
                porcentaje,
                nivelResultado,
                aprobado,
                tiempoEmpleado,
                temasDebiles,
                temasFuertes
            },

            revision: cuestionario.mostrarRevision
                    ? detalleRespuestas.map((r) => ({
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
        return res.status(500).json({
            msg: "Error al resolver cuestionario"
        });
    }
};

//Para verificar si se puede resolver el cuestionario
const verificarAccesoCuestionario = async (req, res) => {
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                msg:"ID de cuestionario inválido"
            });
        }

        const cuestionario = await Cuestionario.findById(id);

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
        const estudiante = await Estudiante.findOne({
            usuario:req.usuario.id
        });
        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }
        if(cuestionario.nivelAcademico !== estudiante.nivelAcademico){
            return res.status(403).json({
                msg:"No pertenece a tu nivel académico"
            });
        }
        const resultadoExistente = await Resultado.findOne({
            estudiante: estudiante.usuario,
            cuestionario: id
        });

        if (resultadoExistente && !cuestionario.permitirReintento){
            return res.status(400).json({
                msg:"Ya realizaste esta evaluación. No se permite más intentos."
            });
        }
        return res.status(200).json({
            puedeResolver:true,
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            msg:"Error al verificar acceso a la evaluación"
        });
    }
}

const actualizarCuestionario = async (req, res) => {
    try {
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                msg:"ID de cuestionario inválido"
            });
        }

        const cuestionario = await Cuestionario.findById(id);

        if (!cuestionario) {
            return res.status(404).json({
                msg: "Cuestionario no encontrado"
            });
        }

        const camposPermitidos = ["titulo", "descripcion", "instrucciones", "tiempoLimite", "nivelAcademic",
                                  "aleatorio", "mostrarRevision", "mostrarRespuestasCorrectas",
                                  "permitirReintento", "estado" ];

        camposPermitidos.forEach((campo) => {

            if (req.body[campo] !== undefined) {
                cuestionario[campo] = req.body[campo];
            }
        });

        await cuestionario.save();

        return res.status(200).json({
            msg: "Cuestionario actualizado correctamente",
            cuestionario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al actualizar cuestionario"
        });
    }
};

// CAMBIAR ESTADO
const eliminarCuestionario = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                msg:"ID de cuestionario inválido"
            });
        }

        const cuestionario = await Cuestionario.findById(id);

        if (!cuestionario) {
            return res.status(404).json({
                msg: "Cuestionario no encontrado"
            });
        }

        cuestionario.estado = !cuestionario.estado;

        await cuestionario.save();

        return res.status(200).json({
            msg: `Cuestionario ${
                    cuestionario.estado
                        ? "activado"
                        : "desactivado"
                } correctamente`,
            cuestionario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al cambiar estado"
        });
    }
};


export { crearCuestionario, obtenerCuestionarios, obtenerCuestionariosDisponibles, obtenerCuestionarioAdminID,
         verificarDiagnosticoMateria, obtenerCuestionarioResolver, resolverCuestionario, actualizarCuestionario,
         eliminarCuestionario, verificarAccesoCuestionario };