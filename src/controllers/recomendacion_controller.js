import AnalisisAcademico from "../models/Recomendaciones/AnalisisAcademico.js";
import Recomendacion from "../models/Recomendaciones/Recomendacion.js";
import Recurso from "../models/Recurso.js";
import Estudiante from "../models/Estudiante.js";

const generarRecomendacionEstudiante = async (
    estudianteId
) => {

    try {

        const analisis =
            await AnalisisAcademico.findOne({
                estudiante: estudianteId
            });

        if (!analisis) {
            return;
        }

        await Recomendacion.deleteMany({
            estudiante: estudianteId
        });

        for (const temaAnalisis of analisis.temas) {

            if (
                temaAnalisis.nivelDominio === "bajo"
            ) {

                const recursos = await Recurso.find({

                    tema: temaAnalisis.tema,

                    estado: true
                });

                if (recursos.length === 0) {
                    continue;
                }

                await Recomendacion.create({

                    estudiante: estudianteId,

                    tema: temaAnalisis.tema,

                    recursos: recursos.map(
                        (r) => r._id
                    ),

                    nivelPrioridad: "alta",

                    motivo:
                        "Bajo rendimiento detectado en este tema",

                    estado: true
                });
            }
        }

    } catch (error) {

        console.log(error);
    }
};

const obtenerMisRecomendaciones = async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({
      usuario: req.usuario.id
    });

    if (!estudiante) {
      return res.status(404).json({
        msg: "Perfil estudiante no encontrado"
      });
    }
    const recomendaciones = await Recomendacion.find({
      estudiante: estudiante._id,
      estado: true
    })
      .populate("tema", "nombre")
      .populate({
        path: "recursos",
        select: "titulo tipo dificultad"
      })
      .sort({ createdAt: -1 });

    return res.json(recomendaciones);

  } catch (error) {

    console.error("Error obtenerMisRecomendaciones:", error);

    return res.status(500).json({
      msg: "Error al obtener recomendaciones"
    });
  }
};

const actualizarAnalisisAcademico = async ({
    estudianteId,
    temas
}) => {

    try {

        let analitica =
            await AnalisisAcademico.findOne({
                estudiante: estudianteId
            });

        if (!analitica) {

            analitica = new AnalisisAcademico({
                estudiante: estudianteId,
                temas: []
            });
        }

        if (!Array.isArray(temas) || temas.length === 0) {
            return;
        }

        for (const temaActual of temas) {

            if (!temaActual.tema) {
                continue;
            }

            const indiceTema =
                analitica.temas.findIndex(

                    (item) =>
                        item.tema.toString()
                        ===
                        temaActual.tema.toString()
                );

            const correctas =
                temaActual.correctas || 0;

            const incorrectas =
                temaActual.incorrectas || 0;

            const total =
                correctas + incorrectas;

            const porcentaje =
                total > 0
                    ? Number(
                        (
                            (correctas / total)
                            * 100
                        ).toFixed(2)
                    )
                    : 0;

            let nivelDominio = "bajo";

            if (porcentaje >= 80) {

                nivelDominio = "alto";

            } else if (porcentaje >= 60) {

                nivelDominio = "medio";
            }

            // SI YA EXISTE

            if (indiceTema !== -1) {

                analitica.temas[indiceTema]
                    .respuestasCorrectas += correctas;

                analitica.temas[indiceTema]
                    .respuestasIncorrectas += incorrectas;

                analitica.temas[indiceTema]
                    .preguntasTotales += total;

                const correctasTotales =
                    analitica.temas[indiceTema]
                        .respuestasCorrectas;

                const preguntasTotales =
                    analitica.temas[indiceTema]
                        .preguntasTotales;

                const nuevoPorcentaje =
                    preguntasTotales > 0
                        ? Number(
                            (
                                (correctasTotales /
                                    preguntasTotales)
                                * 100
                            ).toFixed(2)
                        )
                        : 0;

                analitica.temas[indiceTema]
                    .porcentajeDominio =
                    nuevoPorcentaje;

                if (nuevoPorcentaje >= 80) {

                    analitica.temas[indiceTema]
                        .nivelDominio = "alto";

                } else if (nuevoPorcentaje >= 60) {

                    analitica.temas[indiceTema]
                        .nivelDominio = "medio";

                } else {

                    analitica.temas[indiceTema]
                        .nivelDominio = "bajo";
                }

            } else {

                analitica.temas.push({

                    tema: temaActual.tema,

                    respuestasCorrectas: correctas,

                    respuestasIncorrectas: incorrectas,

                    preguntasTotales: total,

                    porcentajeDominio: porcentaje,

                    nivelDominio
                });
            }
        }

        await analitica.save();

    } catch (error) {

        console.log(error);
    }
};

export {
    generarRecomendacionEstudiante,
    obtenerMisRecomendaciones,
    actualizarAnalisisAcademico
};