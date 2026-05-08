import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generarJWT = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "1h"
        }
    );
}

export default generarJWT;