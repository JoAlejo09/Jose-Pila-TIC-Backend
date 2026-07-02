import { Router } from "express";
import { obtenerResultadosEstudiante, obtenerResultadoPorId, obtenerResultadosAdmin,
         obtenerResultadoAdminPorId, eliminarResultadoAdmin, obtenerUltimosResultados} from "../controllers/resultado_controller.js";

import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";
/**
 * @swagger
 * tags:
 *   - name: Resultados
 *     description: Consulta y administración de los resultados obtenidos en las evaluaciones.
 */
const router = Router();
/**
 * @swagger
 * /api/resultados/admin:
 *   get:
 *     summary: Obtener todos los resultados (Administrador)
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     description: Permite al administrador consultar todos los resultados registrados, con filtros opcionales.
 *     responses:
 *       200:
 *         description: Resultados obtenidos correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/admin", verificarJWT, verificarRol("admin"), obtenerResultadosAdmin);
/**
 * @swagger
 * /api/resultados/admin/{id}:
 *   get:
 *     summary: Obtener un resultado por ID (Administrador)
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     description: Permite visualizar el detalle de un resultado específico.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del resultado.
 *     responses:
 *       200:
 *         description: Resultado encontrado correctamente.
 *       404:
 *         description: Resultado no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get( "/admin/:id", verificarJWT, verificarRol("admin"), obtenerResultadoAdminPorId);
/**
 * @swagger
 * /api/resultados/admin/{id}:
 *   delete:
 *     summary: Eliminar un resultado
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     description: Permite eliminar un resultado registrado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del resultado.
 *     responses:
 *       200:
 *         description: Resultado eliminado correctamente.
 *       404:
 *         description: Resultado no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete( "/admin/:id", verificarJWT, verificarRol("admin"),eliminarResultadoAdmin );
/**
 * @swagger
 * /api/resultados/mis-resultados:
 *   get:
 *     summary: Obtener los resultados del estudiante
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     description: Devuelve el historial de resultados pertenecientes al estudiante autenticado.
 *     responses:
 *       200:
 *         description: Resultados obtenidos correctamente.
 *       404:
 *         description: Perfil del estudiante no encontrado.
 *       500:
 *  
 * 
 */  
router.get( "/mis-resultados", verificarJWT, verificarRol("estudiante","admin"), obtenerResultadosEstudiante);
/**
 * @swagger
 * /api/resultados/ultimos-resultados:
 *   get:
 *     summary: Obtener los últimos resultados del estudiante
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     description: Devuelve las dos evaluaciones más recientes realizadas por el estudiante.
 *     responses:
 *       200:
 *         description: Últimos resultados obtenidos correctamente.
 *       404:
 *         description: Perfil del estudiante no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/ultimos-resultados", verificarJWT, verificarRol("estudiante","admin"),obtenerUltimosResultados);
/**
 * @swagger
 * /api/resultados/{id}:
 *   get:
 *     summary: Obtener detalle de un resultado
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     description: Permite consultar el detalle completo de un resultado perteneciente al estudiante autenticado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del resultado.
 *     responses:
 *       200:
 *         description: Resultado encontrado correctamente.
 *       403:
 *         description: No autorizado para visualizar el resultado.
 *       404:
 *         description: Resultado no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get( "/:id", verificarJWT, verificarRol("estudiante", "admin"),obtenerResultadoPorId );

export default router;
