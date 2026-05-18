import { Router } from "express";

import { crearCuestionario, obtenerCuestionarios, obtenerCuestionariosDisponibles, obtenerCuestionarioID,
         actualizarCuestionario, resolverCuestionario, eliminarCuestionario } from "../controllers/cuestionario_controller.js";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

const router = Router();

router.post("/", verificarJWT, verificarRol("admin"), crearCuestionario);
router.get( "/", verificarJWT, verificarRol("admin"), obtenerCuestionarios);
router.get("/admin/:id", verificarJWT, verificarRol("admin"), obtenerCuestionarioID);
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarCuestionario);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), eliminarCuestionario);
router.get("/disponibles", verificarJWT, verificarRol("estudiante"), obtenerCuestionariosDisponibles);

router.get("/resolver/:id", verificarJWT, verificarRol("estudiante"), obtenerCuestionarioID);
router.post("/resolver/:id",verificarJWT,verificarRol("estudiante"),resolverCuestionario);

export default router;