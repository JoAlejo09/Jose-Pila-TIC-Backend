import mongoose from "mongoose";

const materiaSchema = new mongoose.Schema({
    nombre:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    descripcion:{
        type:String,
        trim:true,
        default:""
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