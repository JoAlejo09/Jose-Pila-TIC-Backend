import {Router} from "express";
import { verificarJWT, soloAdmin} from "../middlewares/auth_middleware.js";
import { actualizarRecurso, cambiarEstadoRecurso, crearRecurso, obtenerRecursoID, obtenerRecursos } from "../controllers/recurso_controller.js"

const router = Router();
router.get("/", verificarJWT, obtenerRecursos);
router.get("/:id", verificarJWT, obtenerRecursoID);
router.post("/", verificarJWT, soloAdmin, crearRecurso);
router.patch("/estado/:id", verificarJWT, soloAdmin, cambiarEstadoRecurso);
router.put("/:id",verificarJWT, soloAdmin, actualizarRecurso);

export default router;