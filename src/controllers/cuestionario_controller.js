import Cuestionario from "../models/Cuestionario.js";
import Pregunta from "../models/Pregunta.js";
import Resultado from "../models/Resultado.js";
import Estudiante from "../models/Estudiante.js";
import Tema from "../models/Tema.js";
import ResultadoDiagnostico from "../models/ResultadoDiagnostico.js";
import mongoose from "mongoose";

// CREAR CUESTIONARIO

const crearCuestionario = async (req, res) => {
    try {
        let { titulo, descripcion, instrucciones, materia, tema, nivelAcademico, alcanceEvaluacion,
              tipoEvaluacion, modoGeneracion, preguntas, cantidadPreguntas, tiempoLimite, nivel,
              aleatorio, mostrarRevision, mostrarRespuestasCorrectas, permitirReintento } = req.body;

        // VALIDACIONES GENERALES
        if ( !titulo || !materia || !nivelAcademico || !alcanceEvaluacion || !tipoEvaluacion || 
             !modoGeneracion || !cantidadPreguntas ) {

            return res.status(400).json({
                msg: "Campos obligatorios"
            });
        }

        const nivelesValidos = [ "1ro BGU", "2do BGU", "3ro BGU"];

        if (!nivelesValidos.includes(nivelAcademico)) {
            return res.status(400).json({
                msg: "Nivel académico inválido"
            });
        }

        const tiposEvaluacion = [ "diagnostico", "refuerzo" ];

        if (!tiposEvaluacion.includes(tipoEvaluacion)) {
            return res.status(400).json({
                msg: "Tipo de evaluación inválido"
            });
        }

        const modosValidos = ["manual", "dinamico" ];

        if (!modosValidos.includes(modoGeneracion)) {
            return res.status(400).json({
                msg: "Modo de generación inválido"
            });
        }

        const alcancesValidos = [ "materia", "tema"];

        if (!alcancesValidos.includes(alcanceEvaluacion)) {
            return res.status(400).json({
                msg: "Alcance inválido"
            });
        }

        if (alcanceEvaluacion === "materia") {
            tema = null;
        }

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

        const nivelFinal = nivel || "medio";
        let preguntasSeleccionadas = [];

        // MODO MANUAL

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

            if (preguntasDB.length !== preguntas.length) {
                return res.status(400).json({
                    msg: "Existen preguntas inválidas"
                });
            }

            preguntasSeleccionadas = preguntasDB.map(
                pregunta => pregunta._id
            );

            if ( preguntasSeleccionadas.length !== Number(cantidadPreguntas)) {
                return res.status(400).json({
                    msg: "Cantidad de preguntas incorrecta"
                });
            }
        }

        // MODO DINAMICO
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

            if ( preguntasDB.length < Number(cantidadPreguntas)) {
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
            tema:alcanceEvaluacion === "tema"
                ? tema
                : null,
            nivelAcademico,
            alcanceEvaluacion,
            tipoEvaluacion,
            modoGeneracion,
            preguntas: preguntasSeleccionadas,

            cantidadPreguntas: Number(cantidadPreguntas),
            tiempoLimite: tiempoLimite || 30,
            nivel: nivelFinal,
            aleatorio: aleatorio || false,
            mostrarRevision: mostrarRevision ?? true,
            mostrarRespuestasCorrectas: mostrarRespuestasCorrectas ?? true,
            permitirReintento: permitirReintento || false
        });

        await cuestionario.save();

        res.status(201).json({
            msg: "Cuestionario creado correctamente",
            cuestionario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al crear cuestionario"
        });
    }
};

// OBTENER CUESTIONARIOS
const obtenerCuestionarios = async (req, res) => {
    try {

        const cuestionarios = await Cuestionario.find()
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

// CUESTIONARIOS DISPONIBLES
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

// OBTENER CUESTIONARIO ADMIN
const obtenerCuestionarioAdminID = async (req, res) => {
    try {
        const { id } = req.params;
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

// OBTENER CUESTIONARIO PARA RESOLVER
const obtenerCuestionarioResolver = async (req, res) => {
    try {
        const { id } = req.params;

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

        res.json(cuestionario);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener cuestionario"
        });
    }
};

// VERIFICAR DIAGNOSTICO
const verificarDiagnosticoMateria = async (req, res) => {
    try {
        const { materiaId } = req.params;

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

        res.json({
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

// RESOLVER CUESTIONARIO
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

        if ( cuestionario.nivelAcademico !== estudiante.nivelAcademico) {
            return res.status(403).json({
                msg: "Nivel académico incorrecto"
            });
        }

        if ( tiempoEmpleado > cuestionario.tiempoLimite * 60) {
            return res.status(400).json({
                msg: "Tiempo excedido"
            });
        }

        const resultadoExistente = await Resultado.findOne({
                estudiante: req.usuario.id,
                cuestionario: id
            });

        if ( resultadoExistente && !cuestionario.permitirReintento ) {
            return res.status(400).json({
                msg: "Ya resolviste este cuestionario"
            });
        }

        const normalizar = (texto) => texto
                ?.toString()
                .trim()
                .toLowerCase();

        let correctas = 0;
        let incorrectas = 0;
        let sinResponder = 0;

        const detalleRespuestas = [];

        for (const pregunta of cuestionario.preguntas) {

            const respuestaEncontrada = respuestas.find(
                (r) => r.pregunta === pregunta._id.toString()
            );

            const respuestaUsuario = respuestaEncontrada?.respuestaUsuario || "";

            let esCorrecta = false;

            if (!respuestaUsuario) {

                sinResponder++;

            } else if ( normalizar(respuestaUsuario) === normalizar( pregunta.respuestaCorrecta)) {
                correctas++;
                esCorrecta = true;
            } else {
                incorrectas++;
            }
            detalleRespuestas.push({
                pregunta: pregunta._id,
                respuestaUsuario,
                respuestaCorrecta: pregunta.respuestaCorrecta,
                esCorrecta,
                explicacion: pregunta.explicacion || ""
            });
        }

        const porcentaje = Number(
            (
                ( correctas / cuestionario.preguntas.length ) * 100
            ).toFixed(2)
        );

        const aprobado = porcentaje >= 70;

        let nivelResultado = "";

        if (porcentaje < 50) {
            nivelResultado = "bajo";
        }
        else if (porcentaje < 80) {
            nivelResultado = "medio";
        }
        else {
            nivelResultado = "alto";
        }

        const resultado = new Resultado({
            estudiante: req.usuario.id,
            cuestionario: id,
            respuestas: detalleRespuestas,
            correctas,
            incorrectas,
            sinResponder,
            puntaje: porcentaje,
            porcentaje,
            nivelResultado,
            aprobado,
            tiempoEmpleado
        });

        await resultado.save();


        if ( cuestionario.tipoEvaluacion === "diagnostico" ) {
            const diagnosticoExiste = await ResultadoDiagnostico.findOne({
                    estudiante: req.usuario.id,
                    materia: cuestionario.materia
                });

            if (!diagnosticoExiste) {

                await ResultadoDiagnostico.create({
                    estudiante: req.usuario.id,
                    materia: cuestionario.materia,
                    cuestionario: cuestionario._id,
                    puntaje: porcentaje,
                    nivelResultado,
                    aprobado
                });
            }
        }

        res.json({
            msg: "Cuestionario resuelto correctamente",
            resultado: {
                correctas,
                incorrectas,
                sinResponder,
                puntaje: porcentaje,
                porcentaje,
                nivelResultado,
                aprobado,
                tiempoEmpleado
            },
            revision: cuestionario.mostrarRevision
                    ? detalleRespuestas.map((r) => ({
                        ...r,
                        respuestaCorrecta:
                            cuestionario.mostrarRespuestasCorrectas
                                ? r.respuestaCorrecta
                                : undefined
                    }))
                    : []
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al resolver cuestionario"
        });
    }
};

// ACTUALIZAR CUESTIONARIO
const actualizarCuestionario = async (req, res) => {
    try {
        const { id } = req.params;

        const cuestionario = await Cuestionario.findById(id);

        if (!cuestionario) {
            return res.status(404).json({
                msg: "Cuestionario no encontrado"
            });
        }

        const camposPermitidos = ["titulo", "descripcion", "instrucciones", "tiempoLimite", "nivel",
                                  "aleatorio", "mostrarRevision", "mostrarRespuestasCorrectas",
                                  "permitirReintento", "estado" ];

        camposPermitidos.forEach((campo) => {

            if (req.body[campo] !== undefined) {
                cuestionario[campo] = req.body[campo];
            }
        });

        await cuestionario.save();

        res.json({
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

        const cuestionario = await Cuestionario.findById(id);

        if (!cuestionario) {
            return res.status(404).json({
                msg: "Cuestionario no encontrado"
            });
        }

        cuestionario.estado = !cuestionario.estado;

        await cuestionario.save();

        res.json({
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
         eliminarCuestionario };