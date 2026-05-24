import mongoose  from "mongoose";
const unidadSchema = new mongoose.Schema({
    nombre:{
        type:String,
        required:true,
        trim:true
    },
    descripcion:{
        type:String,
        trim:true,
        default:""
    },
    materia:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Materia",
        required:true
    },
    nivelAcademico:{
        type:String,
        enum:["1ro BGU", "2do BGU", "3ro BGU"],
        required:true
    },
    orden:{
        type:Number,
        default:1
    },
    estado:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
});
unidadSchema.index({
    materia:1,
    nombre:1,
    nivelAcademico:1
},
{
    unique:true
})
export default mongoose.model("Unidad", unidadSchema);