import {Router } from "express";
import {
    obtenerUnidades,
    obtenerUnidadId,
    crearUnidad,
    actualizarUnidad,
    cambiarEstadoUnidad,
    obtenerUnidadesPorMateria,
    obtenerUnidadesPorMateriaEstudiante
}
from "../controllers/unidad_controller.js";

import {verificarJWT, verificarRol} from "../middlewares/auth_middleware.js"

const router = Router();

router.get("/", verificarJWT, obtenerUnidades);
router.get("/:id",verificarJWT, obtenerUnidadId);
router.post("/",verificarJWT, verificarRol("admin"),crearUnidad);
router.put("/:id",verificarJWT, verificarRol("admin"),actualizarUnidad);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoUnidad);
router.get("/materia/:materiaId", verificarJWT, obtenerUnidadesPorMateria);
router.get("/estudiante/materia/:materiaId",verificarJWT, verificarRol("estudiante"), obtenerUnidadesPorMateriaEstudiante)

export default router;