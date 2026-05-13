import jwt from "jsonwebtoken";

const verificarJWT = (req,res,next)=>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                msg:"No se proporcionó un token válido"
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );
        req.usuario = decoded;
        next();
    } catch (error) {
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({
                msg:"Token expirado"
            });
        }
        return res.status(401).json({
            msg:"Token no válido"
        });
    }
};
const verificarRol = (...rolesPermitidos)=>{

    return (req,res,next)=>{
        if(!req.usuario){
            return res.status(401).json({
                msg:"Usuario no autenticado"
            });
        }
        if( !rolesPermitidos.includes(req.usuario.rol) ){
            return res.status(403).json({
                msg:"No tiene permisos para realizar esta acción"
            });
        }
        next();
    };
};

export { verificarJWT, verificarRol};