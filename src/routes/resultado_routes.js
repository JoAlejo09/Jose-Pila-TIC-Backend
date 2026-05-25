import { Router } from "express";
import { obtenerResultadosEstudiante, obtenerResultadoPorId, obtenerResultadosAdmin,
         obtenerResultadoAdminPorId, eliminarResultadoAdmin, obtenerUltimosResultados} from "../controllers/resultado_controller.js";

import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";

const router = Router();

router.get("/admin", verificarJWT, verificarRol("admin"), obtenerResultadosAdmin);
router.get( "/admin/:id", verificarJWT, verificarRol("admin"), obtenerResultadoAdminPorId);
router.delete( "/admin/:id", verificarJWT, verificarRol("admin"),eliminarResultadoAdmin );
router.get( "/mis-resultados", verificarJWT, verificarRol("estudiante","admin"), obtenerResultadosEstudiante);
router.get("/ultimos-resultados", verificarJWT, verificarRol("estudiante","admin"),obtenerUltimosResultados);
router.get( "/:id", verificarJWT, verificarRol("estudiante", "admin"),obtenerResultadoPorId );

export default router;
