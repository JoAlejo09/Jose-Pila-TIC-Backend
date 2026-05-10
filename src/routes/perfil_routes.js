import {Router} from "express"
import { actualizarPerfil, obtenerPerfil, actualizarFotoPerfil } from "../controllers/perfil_controller.js"
import { verificarJWT } from "../middlewares/auth_middleware.js"
import upload from "../middlewares/carga_middleware.js";

const router = Router();
router.get("/",verificarJWT, obtenerPerfil);
router.put("/actualizar", verificarJWT, actualizarPerfil)
router.patch("/foto", verificarJWT, upload.single("imagen"), 
actualizarFotoPerfil);


export default router;