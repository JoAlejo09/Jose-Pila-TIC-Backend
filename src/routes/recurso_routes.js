import {Router} from "express";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";
import { actualizarRecurso, cambiarEstadoRecurso, crearRecurso, obtenerRecursoID, obtenerRecursos } from "../controllers/recurso_controller.js"
import upload from "../middlewares/carga_middleware.js";

const router = Router();
router.get("/", verificarJWT, obtenerRecursos);
router.get("/:id", verificarJWT, obtenerRecursoID);
router.post("/", verificarJWT, verificarRol("admin"), upload.single("imagen"),crearRecurso);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoRecurso);
router.put("/:id",verificarJWT, verificarRol("admin"), actualizarRecurso);

export default router;