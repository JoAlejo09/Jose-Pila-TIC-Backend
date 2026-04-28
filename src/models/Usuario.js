import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
        },
        isVerified:{
            type: Boolean,
            default: false,
        },
        token: {
            type: String,
        }   
    },
    {timestamps: true}
);
// Método para cifrar el password del veterinario
usuarioSchema.methods.encryptPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
// Método para verificar si el password ingresado es el mismo de la BDD
usuarioSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}
usuarioSchema.methods.generarToken = function(){
    const token = crypto.randomBytes(20).toString("hex");
    this.token = token;
    return token;
}

export default mongoose.model("Usuario", usuarioSchema);

