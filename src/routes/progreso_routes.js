import { Router} from "express";

import {verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";

import { obtenerMiProgreso}  from "../controllers/progresoacademico_controller.js";

/**
 * @swagger
 * tags:
 *   - name: Progreso Académico
 *     description: Consulta del progreso académico del estudiante.
 */
const router = Router();
/**
 * @swagger
 * /api/progresoacademico/mi-progreso:
 *   get:
 *     summary: Obtener el progreso académico del estudiante autenticado
 *     tags: [Progreso Académico]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progreso académico obtenido correctamente.
 *       401:
 *         description: Token inválido o no enviado.
 *       403:
 *         description: Acceso permitido únicamente para estudiantes.
 *       404:
 *         description: Perfil de estudiante o progreso académico no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/mi-progreso",verificarJWT, verificarRol("estudiante"), obtenerMiProgreso);

export default router;