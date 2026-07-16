import { Schema, model } from "mongoose";

const progresoAcademicoSchema = new Schema({

    estudiante:{
        type:Schema.Types.ObjectId,
        ref:"Usuario",
        required:true,
        unique:true
    },
    evaluacionesRendidas:{
        type:Number,
        default:0
    },
    evaluacionesAprobadas:{
        type:Number,
        default:0
    },
    promedioGeneral:{
        type:Number,
        default:0
    },
    tiempoTotalEstudio:{
        type:Number,
        default:0
    },
    recursosVistos:{
        videos:{
            type:Number,
            default:0
        },

        pdfs:{
            type:Number,
            default:0
        },

        teoria:{
            type:Number,
            default:0
        }
    },
    temasFuertes:[
        {
            tema:{
                type:Schema.Types.ObjectId,
                ref:"Tema"
            },
            correctas:{
                type:Number,
                default:0
            }
        }
    ],
    temasDebiles:[
        {
            tema:{
                type:Schema.Types.ObjectId,
                ref:"Tema"
            },

            incorrectas:{
                type:Number,
                default:0
            }
        }
    ],
    ultimaActividad:{
        type:Date
    },
    recursosVisitados:[
        {
            type:Schema.Types.ObjectId,
            ref:"Recurso"
        }
    ]
},{
    timestamps:true
});

export default model(
    "ProgresoAcademico",
    progresoAcademicoSchema
);