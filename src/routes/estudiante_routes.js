import { Router } from "express";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

import { completarPerfilEstudiante, obtenerPerfilEstudiante, actualizarPerfilEstudiante,
        obtenerMateriasEstudiante, obtenerTemasPorMateria, obtenerRecursosPorTema,
        obtenerResultadosEstudiante, obtenerResultadoEstudianteID } from "../controllers/estudiante_controller.js";

const router = Router();


// COMPLETAR PERFIL
router.post( "/completar-perfil", verificarJWT, verificarRol("estudiante"), completarPerfilEstudiante);
// OBTENER PERFIL
router.get( "/perfil", verificarJWT, verificarRol("estudiante"), obtenerPerfilEstudiante);
// ACTUALIZAR PERFIL
router.put( "/perfil", verificarJWT, verificarRol("estudiante"), actualizarPerfilEstudiante );

// OBTENER MATERIAS
router.get("/materias", verificarJWT, verificarRol("estudiante"), obtenerMateriasEstudiante);
// OBTENER TEMAS POR MATERIA
router.get( "/temas/:materiaId", verificarJWT, verificarRol("estudiante"), obtenerTemasPorMateria );
// OBTENER RECURSOS POR TEMA
router.get( "/recursos/:temaId", verificarJWT, verificarRol("estudiante"), obtenerRecursosPorTema);
// OBTENER RESULTADOS
router.get( "/resultados", verificarJWT, verificarRol("estudiante"), obtenerResultadosEstudiante);

router.get( "/resultados/:id", verificarJWT,verificarRol("estudiante"),  obtenerResultadoEstudianteID );

export default router;