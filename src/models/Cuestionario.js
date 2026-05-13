import mongoose from "mongoose";

const cuestionarioSchema = new mongoose.Schema(
{
    titulo:{
        type:String,
        required:true,
        trim:true
    },

    descripcion:{
        type:String,
        trim:true
    },

    instrucciones:{
        type:String,
        trim:true
    },

    materia:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Materia",
        required:true
    },

    tema:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tema",
        default:null
    },

    tipoEvaluacion:{
        type:String,
        enum:["tema","materia"],
        required:true
    },

    preguntas:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Pregunta"
        }
    ],

    cantidadPreguntas:{
        type:Number,
        required:true,
        min:1
    },

    tiempoLimite:{
        type:Number,
        default:30
    },

    nivel:{
        type:String,
        enum:["facil","medio","dificil"],
        default:"medio"
    },

    mostrarRevision:{
        type:Boolean,
        default:true
    },

    estado:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
});

export default mongoose.model(
    "Cuestionario",
    cuestionarioSchema
);