import { Router } from "express";
import {obtenerUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario,activarUsuario} from "../controllers/user_controller.js";
import {verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

const router = Router();

router.use(verificarJWT, verificarRol("admin"));

router.get("/", obtenerUsuarios);
router.post("/",crearUsuario);
router.put("/:id", actualizarUsuario);
router.patch("/:id/desactivar", desactivarUsuario)
router.patch("/:id/activar",activarUsuario)


export default router;