import mongoose from "mongoose";

const resultadoDiagnosticoSchema = new mongoose.Schema({

    estudiante:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Estudiante",
        required:true
    },

    materia:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Materia",
        required:true
    },

    realizado:{
        type:Boolean,
        default:false
    },

    puntaje:{
        type:Number,
        default:0
    },

    fechaRealizacion:{
        type:Date
    }

},{
    timestamps:true
});

export default mongoose.model(
    "ResultadoDiagnostico",
    resultadoDiagnosticoSchema
);