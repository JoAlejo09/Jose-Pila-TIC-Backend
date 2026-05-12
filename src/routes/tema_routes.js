import { Router } from "express";
import { actualizarTema, cambiarEstadoTema, crearTema, obtenerTemaID, obtenerTemas } from "../controllers/tema_controller.js";
import { verificarJWT, soloAdmin } from "../middlewares/auth_middleware.js";

const router = Router();
router.get("/", verificarJWT, obtenerTemas);
router.get("/:id", verificarJWT, obtenerTemaID);
router.post("/", verificarJWT, soloAdmin, crearTema);
router.patch("/estado/:id", verificarJWT, soloAdmin, cambiarEstadoTema)
router.put("/:id", verificarJWT, soloAdmin, actualizarTema);

export default router;