import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = new mongoose.Schema(
    {
        nombre: {
            type:String,
            required: true,
            trim: true
        },
        apellido: {
            type:String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password:{
            type: String,
            required: true,
            minLength: 6
        },
        rol:{
            type:String,
            enum:["admin","tutor","estudiante"],
            default:"estudiante"
        },
        isActive:{
            type: Boolean,
            default: true,
        }
    },
    {timestamps: true}
);
// Método para cifrar el password del veterinario
usuarioSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
// Método para verificar si el password ingresado es el mismo de la BDD
usuarioSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}

export default mongoose.model("Usuario", usuarioSchema);

