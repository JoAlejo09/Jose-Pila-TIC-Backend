import { Router } from "express";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

import { completarPerfilEstudiante, obtenerPerfilEstudiante, actualizarPerfilEstudiante,
        obtenerMateriasEstudiante, obtenerTemasPorMateria, obtenerRecursosPorTema,
        obtenerResultadosEstudiante, obtenerResultadoEstudianteID, agregarMateriaFavorita,
        quitarMateriaFavorita, agregarTemaFavorito, quitarTemaFavorito } from "../controllers/estudiante_controller.js";

const router = Router();

// COMPLETAR PERFIL
router.post( "/completar-perfil", verificarJWT, verificarRol("estudiante"), completarPerfilEstudiante);
router.get( "/perfil", verificarJWT, verificarRol("estudiante"), obtenerPerfilEstudiante);
router.put( "/perfil", verificarJWT, verificarRol("estudiante"), actualizarPerfilEstudiante );

router.get("/materias", verificarJWT, verificarRol("estudiante"), obtenerMateriasEstudiante);
router.get( "/temas/:materiaId", verificarJWT, verificarRol("estudiante"), obtenerTemasPorMateria );
router.get( "/recursos/:temaId", verificarJWT, verificarRol("estudiante"), obtenerRecursosPorTema);

router.get( "/resultados", verificarJWT, verificarRol("estudiante"), obtenerResultadosEstudiante);
router.get( "/resultados/:id", verificarJWT,verificarRol("estudiante"),  obtenerResultadoEstudianteID );

router.post( "/favoritos/:id", verificarJWT, verificarRol("estudiante"), agregarMateriaFavorita );
router.delete( "/favoritos/:id", verificarJWT, verificarRol("estudiante"),quitarMateriaFavorita );
router.post( "/favoritos-temas/:id", verificarJWT, verificarRol("estudiante"), agregarTemaFavorito);
router.delete( "/favoritos-temas/:id", verificarJWT, verificarRol("estudiante"),quitarTemaFavorito );

export default router;