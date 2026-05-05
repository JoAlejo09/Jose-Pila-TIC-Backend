import jwt from "jsonwebtoken";

const verificarJWT = (req, res, next)=>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader|| !authHeader.startsWith("Bearer ")){
            return res.status(401).json({msg:"No se proporcionó un token de autenticación"});
        }
        const parts = authHeader.split(" ");
        if (parts.length !== 2) {
            return res.status(401).json({ msg: "Formato de token inválido" });
        }
        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.usuario = decoded;

        next();

    } catch (error) {
        if(error.name === "TokenExpiredError")
            return res.status(401).json({msg:"Token Expirado"});
        else{
            return res.status(401).json({msg:"Token de autenticación no válido"});        
        }
    }
}
const soloAdmin = (req, res, next)=>{
    if(!req.usuario || req.usuario.rol !== "admin"){
        return res.status(403).json({
            msg:"Acceso denegado. Solo administrador"
        });
    }
    next();
}
export { verificarJWT, soloAdmin };