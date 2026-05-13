import { Router } from "express";

import { crearPregunta, obtenerPreguntas, obtenerPreguntaID,
        actualizarPregunta, eliminarPregunta } from "../controllers/pregunta_controller.js";
import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

const router = Router();
// CREAR PREGUNTA
router.post( "/", verificarJWT, verificarRol("admin"), crearPregunta);
// OBTENER TODAS LAS PREGUNTAS
router.get("/", verificarJWT, verificarRol("admin"), obtenerPreguntas);
// OBTENER PREGUNTA POR ID
router.get("/:id", verificarJWT, verificarRol("admin"),obtenerPreguntaID);
// ACTUALIZAR PREGUNTA
router.put( "/:id", verificarJWT, verificarRol("admin"), actualizarPregunta);
// ELIMINAR PREGUNTA (LOGICA)
router.patch( "/estado/:id", verificarJWT, verificarRol("admin"), eliminarPregunta);

export default router;