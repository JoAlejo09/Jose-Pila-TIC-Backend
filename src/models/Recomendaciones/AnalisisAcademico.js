import mongoose from "mongoose";

/*Usamos estadistica de Tema para usarlo como estructura 
 para calculos para el analisis de recomendaciones  como base. 
 Cada pregunta de los cuestionarios resueltos tienen preguntas y cada pregunta 
 corrresponde a un tema las recomendaciones van para los temas que menos aciertos tiene */

const estadisticaTemaSchema = new mongoose.Schema({

    tema:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tema"
    },

    respuestasCorrectas:{
        type:Number,
        default:0
    },

    respuestasIncorrectas:{
        type:Number,
        default:0
    },

    preguntasTotales:{
        type:Number,
        default:0
    },

    porcentajeDominio:{
        type:Number,
        default:0
    },

    nivelDominio:{
        type:String,
        enum:["bajo","medio","alto"],
        default:"bajo"
    }

},{_id:false});

/*Aqui toma las preguntas acertadas y equivocadas para hacer el calculo
de que hay que recomendar al estudiante*/
const analisisAcademicoSchema = new mongoose.Schema({

    estudiante:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Usuario",
        required:true,
        unique:true
    },

    temas:[
        estadisticaTemaSchema
    ],

    totalPreguntas:{
        type:Number,
        default:0
    },

    totalCorrectas:{
        type:Number,
        default:0
    },

    totalIncorrectas:{
        type:Number,
        default:0
    },

    promedioGeneral:{
        type:Number,
        default:0
    },

    ultimaActualizacion:{
        type:Date,
        default:Date.now
    }

},{
    timestamps:true
});
export default mongoose.model(
    "AnalisisAcademico",
    analisisAcademicoSchema
);