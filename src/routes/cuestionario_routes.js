import {Router} from "express";

import {crearCuestionario, obtenerCuestionarios, obtenerCuestionariosDisponibles,
    obtenerCuestionariosID, actualizarCuestionario, resolverCuestionario, eliminarCuestionario
} from "../controllers/cuestionario_controller.js";

import {verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";

const router = Router();

// CREAR CUESTIONARIO
router.post("/", verificarJWT, verificarRol("admin"), crearCuestionario);
// OBTENER TODOS LOS CUESTIONARIOS
router.get( "/", verificarJWT, verificarRol("admin"), obtenerCuestionarios);
// ACTUALIZAR CUESTIONARIO
router.put("/:id", verificarJWT,verificarRol("admin"), actualizarCuestionario);
// ELIMINAR CUESTIONARIO
router.delete("/:id",verificarJWT,verificarRol("admin"),eliminarCuestionario);
// OBTENER CUESTIONARIO POR ID
router.get("/resolver/:id", verificarJWT, verificarRol("estudiante"),obtenerCuestionariosID);
//OBTENER CUESTIONARIOS DISPONIBLES
router.get("/disponibles",verificarJWT, verificarRol("estudiante"), obtenerCuestionariosDisponibles)
// RESOLVER CUESTIONARIO
router.post("/resolver/:id",verificarJWT, verificarRol("estudiante"),resolverCuestionario);

export default router;