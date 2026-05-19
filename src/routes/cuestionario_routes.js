import { Router } from "express";

import { crearCuestionario, obtenerCuestionarios, obtenerCuestionariosDisponibles,
         obtenerCuestionarioAdminID,
         obtenerCuestionarioResolver,
         actualizarCuestionario, resolverCuestionario, eliminarCuestionario
} from "../controllers/cuestionario_controller.js";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

const router = Router();
// ADMIN

// CREAR CUESTIONARIO
router.post(
    "/",
    verificarJWT,
    verificarRol("admin"),
    crearCuestionario
);


// OBTENER TODOS LOS CUESTIONARIOS
router.get(
    "/",
    verificarJWT,
    verificarRol("admin"),
    obtenerCuestionarios
);


// OBTENER DETALLE CUESTIONARIO ADMIN
router.get(
    "/admin/:id",
    verificarJWT,
    verificarRol("admin"),
    obtenerCuestionarioAdminID
);


// ACTUALIZAR CUESTIONARIO
router.put(
    "/:id",
    verificarJWT,
    verificarRol("admin"),
    actualizarCuestionario
);

// ELIMINACION LOGICA
router.patch(
    "/estado/:id",
    verificarJWT,
    verificarRol("admin"),
    eliminarCuestionario
);

// OBTENER CUESTIONARIOS DISPONIBLES
router.get(
    "/disponibles",
    verificarJWT,
    verificarRol("estudiante"),
    obtenerCuestionariosDisponibles
);


// OBTENER CUESTIONARIO PARA RESOLVER
router.get(
    "/resolver/:id",
    verificarJWT,
    verificarRol("estudiante"),
    obtenerCuestionarioResolver
);


// RESOLVER CUESTIONARIO
router.post(
    "/resolver/:id",
    verificarJWT,
    verificarRol("estudiante"),
    resolverCuestionario
);

export default router;