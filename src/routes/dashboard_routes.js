import { Router } from "express";
import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";
import { obtenerEstadisticasAdmin } from "../controllers/dashboard_controller.js";

const router = Router();
router.get("/estadisticas", verificarJWT, verificarRol("administrador"), obtenerEstadisticasAdmin);

export default router;