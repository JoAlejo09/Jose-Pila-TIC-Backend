import {Router} from "express";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";
import { obtenerMisRecomendaciones } from "../controllers/recomendacion_controller.js";

/**
 * @swagger
 * tags:
 *   - name: Recomendaciones
 *     description: Gestión de recomendaciones personalizadas generadas automáticamente según el desempeño académico del estudiante.
 */
const router = Router();

/**
 * @swagger
 * /api/recomendaciones/mis-recomendaciones:
 *   get:
 *     summary: Obtener las recomendaciones personalizadas del estudiante
 *     description: |
 *       Devuelve las recomendaciones de estudio generadas automáticamente
 *       a partir del análisis del rendimiento académico del estudiante.
 *       Cada recomendación incluye el tema asociado y los recursos sugeridos.
 *     tags: [Recomendaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recomendaciones obtenidas correctamente.
 *       401:
 *         description: Token inválido o no proporcionado.
 *       403:
 *         description: Acceso permitido únicamente para estudiantes.
 *       404:
 *         description: Perfil del estudiante no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
    "/mis-recomendaciones",
    verificarJWT,
    verificarRol("estudiante"),
    obtenerMisRecomendaciones
);

export default router;