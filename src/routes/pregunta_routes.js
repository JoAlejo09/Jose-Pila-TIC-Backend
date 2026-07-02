import { Router } from "express";

import { crearPregunta, obtenerPreguntas, obtenerPreguntaID, actualizarPregunta, cambiarEstadoPregunta } from "../controllers/pregunta_controller.js";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Preguntas
 *     description: Gestión de preguntas utilizadas para la generación de cuestionarios.
 */
const router = Router();
/**
 * @swagger
 * /api/preguntas:
 *   post:
 *     summary: Crear una nueva pregunta
 *     tags: [Preguntas]
 *     security:
 *       - bearerAuth: []
 *     description: Permite al administrador registrar una nueva pregunta para los cuestionarios.
 *     responses:
 *       201:
 *         description: Pregunta creada correctamente.
 *       400:
 *         description: Datos inválidos o incompletos.
 *       404:
 *         description: Materia o tema no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/", verificarJWT, verificarRol("admin"), crearPregunta);
/**
 * @swagger
 * /api/preguntas:
 *   get:
 *     summary: Obtener todas las preguntas
 *     tags: [Preguntas]
 *     security:
 *       - bearerAuth: []
 *     description: Devuelve el listado completo de preguntas registradas.
 *     responses:
 *       200:
 *         description: Lista de preguntas obtenida correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/",verificarJWT, verificarRol("admin"), obtenerPreguntas);
/**
 * @swagger
 * /api/preguntas/{id}:
 *   get:
 *     summary: Obtener una pregunta por ID
 *     tags: [Preguntas]
 *     security:
 *       - bearerAuth: []
 *     description: Obtiene la información completa de una pregunta específica.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la pregunta.
 *     responses:
 *       200:
 *         description: Pregunta encontrada correctamente.
 *       404:
 *         description: Pregunta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:id", verificarJWT, verificarRol("admin"), obtenerPreguntaID);
/**
 * @swagger
 * /api/preguntas/{id}:
 *   put:
 *     summary: Actualizar una pregunta
 *     tags: [Preguntas]
 *     security:
 *       - bearerAuth: []
 *     description: Permite modificar los datos de una pregunta existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la pregunta.
 *     responses:
 *       200:
 *         description: Pregunta actualizada correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Pregunta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarPregunta);
/**
 * @swagger
 * /api/preguntas/estado/{id}:
 *   patch:
 *     summary: Activar o desactivar una pregunta
 *     tags: [Preguntas]
 *     security:
 *       - bearerAuth: []
 *     description: Cambia el estado lógico de una pregunta.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la pregunta.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       404:
 *         description: Pregunta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoPregunta);


export default router;