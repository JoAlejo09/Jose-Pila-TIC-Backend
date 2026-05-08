import mongoose from "mongoose";

const estudianteSchema= new mongoose.Schema(
    {
        usuario:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required:true,
            unique:true,
        },
        fechaNacimiento:{
            type:Date,
        },
        telefono:{
            type:String,
            trim:true
        },
        direccion:{
            type:String,
            trim:true
        },
        institucion:{
            type:String,
            trim:true
        },
        curso:{
            type:String,
            trim:true,
            lowercase:true
        },
        nivelAcademico:{
            type:String,
            trim:true
        },
        fotoPerfil: {
            type: String
        }
    });
    export default mongoose.model("Estudiante", estudianteSchema);