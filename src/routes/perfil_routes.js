import {Router} from "express"
import { actualizarPerfil, obtenerPerfil } from "../controllers/perfil_controller.js"
import { verificarJWT } from "../middlewares/auth_middleware.js"

const router = Router();
router.get("/",verificarJWT, obtenerPerfil);
router.put("/actualizar", verificarJWT, actualizarPerfil)

export default router;