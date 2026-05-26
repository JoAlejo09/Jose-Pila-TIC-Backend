import ProgresoAcademico from "../models/ProgresoAcademico.js";
import Estudiante from "../models/Estudiante.js";

const obtenerMiProgreso = async (req, res) => {

    try {

        const estudiante = await Estudiante.findOne({
            usuario: req.usuario.id
        });

        if (!estudiante) {

            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const progreso = await ProgresoAcademico.findOne({
            estudiante: estudiante._id
        })
        .populate("temasFuertes.tema", "nombre")
        .populate("temasDebiles.tema", "nombre");

        if (!progreso) {

            return res.status(404).json({
                msg: "Progreso académico no encontrado"
            });
        }

        return res.json(progreso);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg: "Error al obtener progreso académico"
        });
    }
};

const actualizarProgresoAcademico = async ({
    estudianteId,
    tipoEvaluacion,
    porcentaje,
    aprobado,
    tiempoEmpleado,
    temasFuertes,
    temasDebiles

}) => {

    try {

        let progreso = await ProgresoAcademico.findOne({
            estudiante: estudianteId
        });

        // CREAR SI NO EXISTE

        if (!progreso) {

            progreso = await ProgresoAcademico.create({
                estudiante: estudianteId
            });
        }

        // SOLO EVALUACIONES DE REFUERZO
        // AFECTAN EL PROGRESO GENERAL

        if (tipoEvaluacion === "refuerzo") {

            progreso.evaluacionesRendidas += 1;

            if (aprobado) {

                progreso.evaluacionesAprobadas += 1;
            }

            progreso.promedioGeneral = Number(
                (
                    (
                        progreso.promedioGeneral
                        *
                        (
                            progreso.evaluacionesRendidas - 1
                        )
                    )
                    +
                    porcentaje
                )
                /
                progreso.evaluacionesRendidas
            ).toFixed(2);

            progreso.tiempoTotalEstudio += tiempoEmpleado;
        }

        // ACTUALIZAR TEMAS

        progreso.temasFuertes = temasFuertes || [];

        progreso.temasDebiles = temasDebiles || [];

        progreso.ultimaActividad = new Date();

        await progreso.save();

    } catch (error) {

        console.log(error);
    }
};

const registrarUsoRecurso = async (
    estudianteId,
    recursoId,
    tipo
) => {

    try {

        let progreso = await ProgresoAcademico.findOne({
            estudiante: estudianteId
        });

        // CREAR SI NO EXISTE

        if (!progreso) {

            progreso = await ProgresoAcademico.create({
                estudiante: estudianteId
            });
        }

        // VALIDAR SI YA VISITÓ EL RECURSO

        const yaExiste = progreso.recursosVisitados.some(

            (recurso) =>
                recurso.toString()
                ===
                recursoId.toString()
        );

        if (yaExiste) {
            return;
        }

        progreso.recursosVisitados.push(recursoId);

        // CONTADOR POR TIPO

        if (tipo === "video") {

            progreso.recursosVistos.videos += 1;
        }

        if (tipo === "pdf") {

            progreso.recursosVistos.pdfs += 1;
        }

        if (tipo === "teoria") {

            progreso.recursosVistos.teoria += 1;
        }

        progreso.ultimaActividad = new Date();

        await progreso.save();

    } catch (error) {

        console.log(error);
    }
};

export {
    obtenerMiProgreso,
    actualizarProgresoAcademico,
    registrarUsoRecurso
};