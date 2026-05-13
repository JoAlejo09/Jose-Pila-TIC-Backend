import { Router } from "express";
import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";
import { actualizarMateria, cambiarEstadoMateria, crearMateria, obtenerMateriaID, obtenerMaterias } from "../controllers/materia_controller.js";

const router = Router();

// OBTENER TODAS LAS MATERIAS
router.get("/", verificarJWT, obtenerMaterias);
// CREAR MATERIA
router.post("/", verificarJWT, verificarRol("admin"), crearMateria);
// CAMBIAR ESTADO
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoMateria);
// ACTUALIZAR MATERIA
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarMateria);
// OBTENER MATERIA POR ID
router.get("/:id", verificarJWT, obtenerMateriaID);

export default router;