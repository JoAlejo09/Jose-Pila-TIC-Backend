import { Router } from "express";
import { registrarUsuario, confirmarCuenta, loginUsuario, recuperarContrasena, comprobarToken,  crearNuevoPassword} from "../controllers/user_controller.js";
const router = Router();
//Rutas publicas
router.post("/registrar", registrarUsuario);
router.get("/confirmar/:token", confirmarCuenta);
router.post("/login", loginUsuario);
router.post ("/recuperar", recuperarContrasena);
router.get("/recuperar/:token", comprobarToken);
router.post("/recuperar/:token", crearNuevoPassword);

export default router;