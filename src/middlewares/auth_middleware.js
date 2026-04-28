import jwt from "jsonwebtoken";

const verificarJWT = (req, res, next)=>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({msg:"No se proporcionó un token de autenticación"});
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.usuario = decoded;

        next();

    } catch (error) {
        return res.status(401).json({msg:"Token de autenticación no válido"});        
    }
}
const soloAdmin = (req, res, next)=>{
    if(req.usuario.rol !== "admin"){
        return res.status(403).json({msg:"Acceso denegado. Solo los administradores pueden acceder a este recurso"});
    }
    next();
}
export { verificarJWT, soloAdmin };