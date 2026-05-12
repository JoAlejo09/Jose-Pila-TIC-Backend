import { Router } from "express";
import { verificarJWT } from "../middlewares/auth_middleware.js";
import {
    obtenerMateriasEstudiante,
    obtenerTemasPorMateria,
    obtenerRecursosPorTema
} from "../controllers/estudiante_controller.js";

const router = Router();

// MATERIAS ESTUDIANTE
router.get("/materias", verificarJWT, obtenerMateriasEstudiante);
// TEMAS POR MATERIA
router.get("/temas/:materiaId",verificarJWT,obtenerTemasPorMateria);
// RECURSOS POR TEMA
router.get("/recursos/:temaId",verificarJWT,obtenerRecursosPorTema);

export default router;