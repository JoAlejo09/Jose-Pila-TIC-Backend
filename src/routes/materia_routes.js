import { Router } from "express";
import { verificarJWT, soloAdmin } from "../middlewares/auth_middleware.js";
import { actualizarMateria, cambiarEstadoMateria, crearMateria, obtenerMateriaID, obtenerMaterias } from "../controllers/materia_controller.js";

const router = Router();

// OBTENER TODAS LAS MATERIAS
router.get("/", verificarJWT, obtenerMaterias);
// CREAR MATERIA
router.post("/", verificarJWT, soloAdmin, crearMateria);
// CAMBIAR ESTADO
router.patch("/estado/:id", verificarJWT, soloAdmin, cambiarEstadoMateria);
// ACTUALIZAR MATERIA
router.put("/:id", verificarJWT, soloAdmin, actualizarMateria);
// OBTENER MATERIA POR ID
router.get("/:id", verificarJWT, obtenerMateriaID);

export default router;