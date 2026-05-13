import mongoose from "mongoose";

const resultadoSchema = new mongoose.Schema(
{
    estudiante:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Usuario",
        required:true
    },

    cuestionario:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cuestionario",
        required:true
    },

    respuestas:[
        {
            pregunta:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Pregunta"
            },

            respuestaUsuario:{
                type:String,
                default:""
            },

            respuestaCorrecta:{
                type:String,
                required:true
            },

            esCorrecta:{
                type:Boolean,
                default:false
            },

            explicacion:{
                type:String,
                default:""
            }
        }
    ],

    correctas:{
        type:Number,
        default:0
    },

    incorrectas:{
        type:Number,
        default:0
    },

    sinResponder:{
        type:Number,
        default:0
    },

    puntaje:{
        type:Number,
        default:0
    },

    tiempoEmpleado:{
        type:Number,
        default:0
    }

},
{
    timestamps:true
});

export default mongoose.model(
    "ResultadoCuestionario",
    resultadoSchema
);