import { Router} from "express";

import {verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";

import { obtenerMiProgreso}  from "../controllers/progresoacademico_controller.js";

const router = Router();
router.get("/mi-progreso",verificarJWT, verificarRol("estudiante"), obtenerMiProgreso);

export default router;