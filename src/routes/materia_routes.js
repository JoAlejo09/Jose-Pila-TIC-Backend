import { Router } from "express";
import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";
import { actualizarMateria, cambiarEstadoMateria, crearMateria, obtenerMateriaID, obtenerMaterias } from "../controllers/materia_controller.js";

const router = Router();

router.get("/", verificarJWT, obtenerMaterias);
router.post("/", verificarJWT, verificarRol("admin"), crearMateria);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoMateria);
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarMateria);
router.get("/:id", verificarJWT, obtenerMateriaID);

export default router; 