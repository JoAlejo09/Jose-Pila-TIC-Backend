import { Router } from "express";
import { registrarUsuario, confirmarCuenta, loginUsuario, recuperarContrasena, comprobarToken,  crearNuevoPassword} from "../controllers/user_controller.js";
import {verificarJWT, soloAdmin } from "../middlewares/auth_middleware.js";

const router = Router();

router.post("/registrar", registrarUsuario);
router.get("/confirmar/:token", confirmarCuenta);
router.post("/login", loginUsuario);
router.post ("/recuperar", recuperarContrasena);
router.get("/recuperar/:token", comprobarToken);
router.post("/recuperar/:token", crearNuevoPassword);

router.get("/perfil", verificarJWT,(req, res)=>{
    res.json({
        msg: "Acceso permitido",
        usuario: req.usuario,
    })
})
router.get("/admin",verificarJWT, soloAdmin, (req, res)=>{
    res.json({
        msg: "Acceso permitido solo para administradores",
        usuario: req.usuario,
    })
})

export default router;