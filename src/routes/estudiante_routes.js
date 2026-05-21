import { Router } from "express";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";
import { completarPerfilEstudiante, obtenerPerfilEstudiante, actualizarPerfilEstudiante,
         obtenerMateriasEstudiante, obtenerTemasPorMateria, obtenerRecursosPorTema,
         obtenerRecursoPorId, agregarMateriaFavorita, quitarMateriaFavorita, agregarTemaFavorito, quitarTemaFavorito
} from "../controllers/estudiante_controller.js";

const router = Router();

// COMPLETAR PERFIL
router.post("/completar-perfil", verificarJWT, verificarRol("estudiante"), completarPerfilEstudiante);
router.get("/perfil", verificarJWT, verificarRol("estudiante"), obtenerPerfilEstudiante);
router.put("/perfil", verificarJWT, verificarRol("estudiante"), actualizarPerfilEstudiante);
// MATERIAS
router.get("/materias", verificarJWT, verificarRol("estudiante"), obtenerMateriasEstudiante);
router.post("/favoritos/:id", verificarJWT, verificarRol("estudiante"), agregarMateriaFavorita);
router.delete("/favoritos/:id", verificarJWT, verificarRol("estudiante"), quitarMateriaFavorita);
// TEMAS
router.get("/temas/:materiaId", verificarJWT, verificarRol("estudiante"), obtenerTemasPorMateria);
router.post( "/favoritos-temas/:id", verificarJWT, verificarRol("estudiante"), agregarTemaFavorito );
router.delete( "/favoritos-temas/:id", verificarJWT, verificarRol("estudiante"), quitarTemaFavorito );
// RECURSOS
router.get("/recursos/:temaId", verificarJWT, verificarRol("estudiante"), obtenerRecursosPorTema );
router.get( "/recurso/:id", verificarJWT, verificarRol("estudiante"), obtenerRecursoPorId );


export default router;