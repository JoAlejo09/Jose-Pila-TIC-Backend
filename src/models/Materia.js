import mongoose from "mongoose";

const materiaSchema = new mongoose.Schema({
    nombre:{
        type:String,
        required:true,
        trim:true,
    },
    descripcion:{
        type:String,
        trim:true,
        default:""
    },
    nivelAcademico:{
        type:String,
        required:true,
        enum:["1ro BGU","2do BGU","3ro BGU"]

    },
    estado:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
});

export default mongoose.model("Materia", materiaSchema);