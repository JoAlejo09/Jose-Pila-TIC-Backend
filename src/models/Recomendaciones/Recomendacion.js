import mongoose from "mongoose";

//Una vez realizado los calculos de analisis se procede a hacer las
//recomendaciones para el estudiante
const recomendacionSchema = new mongoose.Schema({
    estudiante:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Usuario"
    },
    tema:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tema"
    },
    recursos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Recurso"
        }
    ],
    nivelPrioridad:{
        type:String,
        enum:["alta","media","baja"],
        default:"media"
    },
    motivo:{
        type:String
    },
    estado:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
});

export default mongoose.model(
    "Recomendacion",
    recomendacionSchema
);