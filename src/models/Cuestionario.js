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

    nivelAcademico:{
        type:String,
        enum:[
            "1ro BGU",
            "2do BGU",
            "3ro BGU"
        ],
        required:true
    },

    tipoEvaluacion:{
        type:String,
        enum:[
            "tema",
            "materia"
        ],
        required:true
    },

    tipoCuestionario:{
        type:String,
        enum:[
            "diagnostico",
            "practica",
            "refuerzo",
            "simulador"
        ],
        default:"practica"
    },

    modoGeneracion:{
        type:String,
        enum:[
            "manual",
            "dinamico"
        ],
        default:"manual"
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
        enum:[
            "facil",
            "medio",
            "dificil"
        ],
        default:"medio"
    },

    aleatorio:{
        type:Boolean,
        default:false
    },

    mostrarRevision:{
        type:Boolean,
        default:true
    },

    mostrarRespuestasCorrectas:{
        type:Boolean,
        default:true
    },

    permitirReintento:{
        type:Boolean,
        default:false
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