import { Router } from "express";
import { verificarJWT,verificarRol } from "../middlewares/auth_middleware.js";
import {
    obtenerMateriasEstudiante,
    obtenerTemasPorMateria,
    obtenerRecursosPorTema,
    obtenerResultadosEstudiante,
    obtenerResultadoEstudianteID
} from "../controllers/estudiante_controller.js";

const router = Router();

// MATERIAS ESTUDIANTE
router.get("/materias", verificarJWT, verificarRol("estudiante"),obtenerMateriasEstudiante);
// TEMAS POR MATERIA
router.get("/temas/:materiaId",verificarJWT,verificarRol("estudiante"),obtenerTemasPorMateria);
// RECURSOS POR TEMA
router.get("/recursos/:temaId",verificarJWT,verificarRol("estudiante"),obtenerRecursosPorTema);
//CUESTIONARIOS
router.get("/resultados", verificarJWT, verificarRol("estudiante"), obtenerResultadosEstudiante);

router.get("/resultados/:id", verificarJWT, verificarRol("estudiante"), obtenerResultadoEstudianteID);

export default router;