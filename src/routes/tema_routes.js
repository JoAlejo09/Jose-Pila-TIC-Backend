import { Router } from "express";
import { actualizarTema, cambiarEstadoTema, crearTema, obtenerTemaID, obtenerTemas,
    obtenerTemasPorMateriaNivel, obtenerTemasPorMateria} from "../controllers/tema_controller.js";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";
import { obtenerTemasPorMateriaRequest } from "../../../Jose-Pila-TIC-Frontend/frontend/src/services/temaService.js";

const router = Router();
router.get("/", verificarJWT, obtenerTemas);
router.get("/:id", verificarJWT, obtenerTemaID);
router.post("/", verificarJWT, verificarRol("admin"), crearTema);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoTema)
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarTema);
router.get("/materia/:materiaId/nivel/:nivelAcademico", verificarJWT,verificarRol("admin"), obtenerTemasPorMateriaNivel)
router.get("/materia/:materiaId",obtenerTemasPorMateria);

export default router;