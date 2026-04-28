import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generarJWT =(usuario) =>{
    return jwt.sign({
        id: usuario._id,
        rol: usuario.rol
    },
    process.env.JWT_SECRET_KEY,{
        expiresIn: "200s"
    });
}
export default generarJWT;