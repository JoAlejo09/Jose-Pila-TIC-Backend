import {Router} from "express";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";
import { obtenerMisRecomendaciones } from "../controllers/recomendacion_controller.js";

const router = Router();
router.get("/mis-recomendaciones", verificarJWT, verificarRol("estudiante"), obtenerMisRecomendaciones)

export default router;