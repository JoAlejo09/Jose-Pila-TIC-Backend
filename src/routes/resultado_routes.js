import { Router } from "express";
import { obtenerResultadosEstudiante, obtenerResultadoPorId } from "../controllers/resultado_controller.js";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";

const router = Router();

router.get("/mis-resultados",verificarJWT, verificarRol("estudiante"), obtenerResultadosEstudiante);
router.get("/:id", verificarJWT, verificarRol("estudiante"),obtenerResultadoPorId);

export default router; 
