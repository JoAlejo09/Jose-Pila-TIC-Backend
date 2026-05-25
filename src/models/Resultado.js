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
    materia:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Materia"
    },
    respuestas:[
        {
            pregunta:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Pregunta"
            },
            tema:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Tema"
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
    porcentaje:{
        type:Number,
        default:0
    },
    nivelResultado:{
        type:String,
        enum:["bajo","medio","alto"],
        default:"bajo"
    },
    aprobado:{
        type:Boolean,
        default:false
    },
    tiempoEmpleado:{
        type:Number,
        default:0
    },
    temasDebiles:[
        {
            tema:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Tema"
            },

            incorrectas:{
                type:Number,
                default:0
            }
        }
    ],
    temasFuertes:[
        {
            tema:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Tema"
            },

            correctas:{
                type:Number,
                default:0
            }
        }
    ]

},
{
    timestamps:true
});

export default mongoose.model( "Resultado", resultadoSchema );