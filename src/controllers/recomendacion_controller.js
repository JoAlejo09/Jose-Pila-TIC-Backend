import AnalisisAcademico from "../models/Recomendaciones/analisisAcademico.js";
import Recomendacion from "../models/Recomendaciones/Recomendacion.js";
import Recurso from "../models/Recurso.js";

const generarRecomendacionEstudiante = async(estudianteId)=>{
    try {
        const analisis = await AnalisisAcademico-findOne({
            estudiante: estudianteId
        });
        if(!analisis){
            return;
        }
        //Para mantener las recomendaciones actualizadas
        //es necesario quitar lo anterior y hacer nuevas
        await Recomendacion.deleteMany({
            estudiante:estudianteId
        });
        //Para evaluar que temas son los que mas falla el estudiante
        for(const temaAnalisis of analisis.temas){
            if(temaAnalisis.nivelDominio === "bajo"){
                const recursos = await Recurso.find({
                    tema: temaAnalisis.tema,
                    estado:true
                })
                .sort({dificultad:1})

                await Recomendacion.create({
                    estudiante: estudianteId,
                    tema: temaAnalisis.tema,
                    recursos:recursos.map(
                        (recurso)=>recurso._id
                    ),nivelPrioridad:"alta",
                    motivo: "Bajo rendimiento detectado en este tema"
                });
            }
        }
    } catch (error) {
        console.log(error);        
    }
}

const obtenerMisRecomendaciones = async(req,res)=>{
    try {
        const recomendaciones = await Recomendacion.find({
            estudiante: req.usuario.id,
            estado:true
        })
        .populate("tema","nombre")
        .populate({
            path:"recursos",
            select:"titulo tipo dificultad"
        })
        return res.json(recomendaciones)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg:"Error al obtener recomendaciones"
        })
    }
}
const actualizarAnalisisAcademico = async({
    estudianteId,
    cuestionarioId,
    materiaId,
    temas

})=>{

    try {

        let analitica =
            await AnalisisAcademico.findOne({

                estudiante: estudianteId
            });

        // CREAR ANALÍTICA SI NO EXISTE

        if(!analitica){

            analitica = new AnalisisAcademico({

                estudiante: estudianteId,

                estadisticasTemas: []
            });
        }

        // RECORRER TEMAS DEL CUESTIONARIO

        for(const temaActual of temas){

            const indiceTema =
                analitica.estadisticasTemas.findIndex(

                    (item)=>
                        item.tema.toString()
                        ===
                        temaActual.tema.toString()
                );

            const totalPreguntas =
                temaActual.correctas
                +
                temaActual.incorrectas;

            const porcentajeTema = Number(

                (
                    (temaActual.correctas / totalPreguntas)
                    * 100
                ).toFixed(2)
            );

            // SI EL TEMA YA EXISTE

            if(indiceTema !== -1){

                analitica.estadisticasTemas[indiceTema]
                    .correctas += temaActual.correctas;

                analitica.estadisticasTemas[indiceTema]
                    .incorrectas += temaActual.incorrectas;

                analitica.estadisticasTemas[indiceTema]
                    .vecesEvaluado += 1;

                const correctasTotales =
                    analitica.estadisticasTemas[indiceTema]
                    .correctas;

                const incorrectasTotales =
                    analitica.estadisticasTemas[indiceTema]
                    .incorrectas;

                const total =
                    correctasTotales
                    +
                    incorrectasTotales;

                analitica.estadisticasTemas[indiceTema]
                    .porcentajeDominio = Number(

                        (
                            (correctasTotales / total)
                            * 100
                        ).toFixed(2)
                    );

                analitica.estadisticasTemas[indiceTema]
                    .ultimaActualizacion = new Date();

            }else{

                // CREAR NUEVO TEMA

                analitica.estadisticasTemas.push({

                    tema: temaActual.tema,

                    materia: materiaId,

                    cuestionarios: [cuestionarioId],

                    correctas: temaActual.correctas,

                    incorrectas: temaActual.incorrectas,

                    vecesEvaluado: 1,

                    porcentajeDominio: porcentajeTema,

                    ultimaActualizacion: new Date()
                });
            }
        }

        await analitica.save();

    } catch (error) {

        console.log(error);
    }
};
export {generarRecomendacionEstudiante, obtenerMisRecomendaciones,actualizarAnalisisAcademico};
