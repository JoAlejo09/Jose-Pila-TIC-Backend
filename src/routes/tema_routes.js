import { Router } from "express";
import { actualizarTema, cambiarEstadoTema, crearTema, obtenerTemaId, obtenerTemas,
    obtenerTemasPorUnidad} from "../controllers/tema_controller.js";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";


const router = Router();
router.get("/", verificarJWT, obtenerTemas);
router.get("/:id", verificarJWT, obtenerTemaId);
router.post("/", verificarJWT, verificarRol("admin"), crearTema);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoTema)
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarTema);
router.get("/unidad/:unidadId",verificarJWT, obtenerTemasPorUnidad)

export default router;