import mongoose from "mongoose";
import dotenv from "dotenv";
import Usuario from "../models/Usuario.js";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

const crearAdmin = async () =>{
    try {
        console.log(process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);        
        const existe = await Usuario.findOne({email: "josealejandro_pilavizuete@hotmail.com"});
        if(existe){
            console.log("El admin ya existe")
            process.exit();
        }
        const admin = new Usuario({
            nombre: "Admin",
            apellido: "Principal",
            email: "josealejandro_pilavizuete@hotmail.com",
            password: "ttyEUgm323X1", // temporal
            rol: "admin",
            isVerified: true,
            isActive: true
        });
        admin.password = await admin.encryptPassword(admin.password);
        await admin.save();
    
        console.log("✅ Admin creado correctamente");
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
        
    }
}

crearAdmin();