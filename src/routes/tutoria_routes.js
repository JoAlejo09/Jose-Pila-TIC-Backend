import { Router } from "express";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

import { crearTutoria, obtenerMisTutorias, cancelarTutoria, calificarTutoria, obtenerTutoriasPendientes,
         aceptarTutoria, liberarTutoria, editarTutoria, obtenerTutoriasTutor, finalizarTutoria, obtenerTodasTutorias,
         cancelarTutoriaAdmin } from "../controllers/tutoria_controller.js";

const router = Router();

//Para estudiante
router.post( "/", verificarJWT, verificarRol("estudiante"), crearTutoria);
router.get( "/mis-tutorias", verificarJWT, verificarRol("estudiante"), obtenerMisTutorias);
router.put( "/cancelar/:id", verificarJWT, verificarRol("estudiante"), cancelarTutoria);
router.put( "/calificar/:id", verificarJWT, verificarRol("estudiante"), calificarTutoria);
router.put( "/editar/:id", verificarJWT, verificarRol("estudiante"), editarTutoria);

// Para tutores
router.get( "/pendientes", verificarJWT, verificarRol("tutor"), obtenerTutoriasPendientes);
router.put( "/aceptar/:id", verificarJWT, verificarRol("tutor"), aceptarTutoria);
router.put( "/liberar/:id", verificarJWT, verificarRol("tutor"), liberarTutoria);
router.get( "/mis-tutorias-tutor", verificarJWT, verificarRol("tutor"), obtenerTutoriasTutor);
router.put( "/finalizar/:id", verificarJWT, verificarRol("tutor"), finalizarTutoria );

// Para administrador
router.get( "/admin/todas", verificarJWT, verificarRol("admin"), obtenerTodasTutorias );
router.put( "/admin/cancelar/:id", verificarJWT, verificarRol("admin"), cancelarTutoriaAdmin);

export default router;