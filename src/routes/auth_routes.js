import { Router } from "express";
import { verificarJWT } from "../middlewares/auth_middleware.js";
import { registrarUsuario, confirmarCuenta, loginUsuario, recuperarContrasena, comprobarToken,  crearNuevoPassword,
    reenviarConfirmacion, cambiarPasswordObligatorio } from "../controllers/user_controller.js";
const router = Router();
//Rutas publicas
router.post("/registrar", registrarUsuario);
router.get("/confirmar/:token", confirmarCuenta);
router.post("/login", loginUsuario);
router.post ("/recuperar", recuperarContrasena);
router.get("/recuperar/:token", comprobarToken);
router.post("/recuperar/:token", crearNuevoPassword);
router.post("/reenviar-confirmacion",reenviarConfirmacion);
router.patch(
   "/cambiar-password",
   verificarJWT,
   cambiarPasswordObligatorio
);

export default router;