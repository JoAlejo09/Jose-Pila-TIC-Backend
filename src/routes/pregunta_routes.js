import { Router } from "express";

import { crearPregunta, obtenerPreguntas, obtenerPreguntaID, actualizarPregunta, cambiarEstadoPregunta } from "../controllers/pregunta_controller.js";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

const router = Router();

router.post("/", verificarJWT, verificarRol("admin"), crearPregunta);
router.get("/",verificarJWT, verificarRol("admin"), obtenerPreguntas);
router.get("/:id", verificarJWT, verificarRol("admin"), obtenerPreguntaID);
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarPregunta);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoPregunta);


export default router;