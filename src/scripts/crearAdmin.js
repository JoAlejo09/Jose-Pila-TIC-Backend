import mongoose from "mongoose";
import dotenv from "dotenv";
import Usuario from "../models/Usuario.js";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

const crearAdmin = async () =>{
    try {
        console.log(process.env.MONGODB_URI_PRODUCTION);
        await mongoose.connect(process.env.MONGODB_URI_PRODUCTION);        
        const existe = await Usuario.findOne({email: "alejopila6@gmail.com"});
        if(existe){
            console.log("El admin ya existe")
            process.exit();
        }
        const admin = new Usuario({
            nombre: "Admin",
            apellido: "Principal",
            email: "alejopila6@gmail.com",
            password: "123456", // temporal
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