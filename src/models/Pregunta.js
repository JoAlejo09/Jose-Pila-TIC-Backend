import mongoose from "mongoose";

const preguntaSchema = new mongoose.Schema(
{
    enunciado:{
        type:String,
        required:true,
        trim:true
    },

    tipoPregunta:{
        type:String,
        enum:[
            "opcion_multiple",
            "verdadero_falso",
            "respuesta_corta"
        ],
        required:true
    },

    materia:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Materia",
        required:true
    },

    tema:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tema",
        required:true
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

    opciones:[
        {
            texto:{
                type:String,
                trim:true
            }
        }
    ],

    respuestaCorrecta:{
        type:String,
        required:true,
        trim:true
    },

    recursoApoyo:{
        tipo:{
            type:String,
            enum:[
                "imagen",
                "video",
                "pdf",
                "formula",
                "enlace"
            ],
            default:null
        },

        url:{
            type:String,
            default:null
        },

        contenido:{
            type:String,
            default:null
        }
    },

    explicacion:{
        type:String,
        default:""
    },

    nivelDificultad:{
        type:String,
        enum:[
            "facil",
            "medio",
            "dificil"
        ],
        default:"medio"
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
    "Pregunta",
    preguntaSchema
);