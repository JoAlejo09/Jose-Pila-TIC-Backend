import {Router } from "express";
import {
    obtenerUnidades,
    obtenerUnidadId,
    crearUnidad,
    actualizarUnidad,
    cambiarEstadoUnidad,
    obtenerUnidadesPorMateria,
    obtenerUnidadesPorMateriaEstudiante
}
from "../controllers/unidad_controller.js";

import {verificarJWT, verificarRol} from "../middlewares/auth_middleware.js"
/**
 * @swagger
 * tags:
 *   - name: Unidades
 *     description: Gestión de las unidades académicas. Permite administrar las unidades de cada materia y consultar las unidades disponibles para estudiantes.
 */
const router = Router();
/**
 * @swagger
 * /unidades:
 *   get:
 *     summary: Obtener listado de unidades
 *     description: Devuelve todas las unidades registradas en el sistema junto con la materia a la que pertenecen.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unidades obtenidas correctamente.
 *       500:
 *         description: Error del servidor.
 */
router.get("/", verificarJWT, obtenerUnidades);
/**
 * @swagger
 * /unidades/{id}:
 *   get:
 *     summary: Obtener una unidad por ID
 *     description: Devuelve la información de una unidad específica.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la unidad.
 *     responses:
 *       200:
 *         description: Unidad obtenida correctamente.
 *       404:
 *         description: Unidad no encontrada.
 */
router.get("/:id",verificarJWT, obtenerUnidadId);
/**
 * @swagger
 * /unidades:
 *   post:
 *     summary: Crear una nueva unidad
 *     description: Registra una nueva unidad académica asociada a una materia. Solo administradores.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - materia
 *               - nivelAcademico
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               materia:
 *                 type: string
 *                 description: ID de la materia.
 *               nivelAcademico:
 *                 type: string
 *                 enum:
 *                   - 1ro BGU
 *                   - 2do BGU
 *                   - 3ro BGU
 *               orden:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Unidad creada correctamente.
 *       400:
 *         description: Datos inválidos o unidad duplicada.
 *       404:
 *         description: Materia no encontrada.
 */
router.post("/",verificarJWT, verificarRol("admin"),crearUnidad);
/**
 * @swagger
 * /unidades/{id}:
 *   put:
 *     summary: Actualizar una unidad
 *     description: Modifica la información de una unidad existente.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la unidad.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               nivelAcademico:
 *                 type: string
 *               orden:
 *                 type: integer
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Unidad actualizada correctamente.
 *       404:
 *         description: Unidad no encontrada.
 */
router.put("/:id",verificarJWT, verificarRol("admin"),actualizarUnidad);
/**
 * @swagger
 * /unidades/estado/{id}:
 *   patch:
 *     summary: Activar o desactivar una unidad
 *     description: Cambia el estado de una unidad entre activa e inactiva.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la unidad.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       404:
 *         description: Unidad no encontrada.
 */
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoUnidad);
/**
 * @swagger
 * /unidades/estado/{id}:
 *   patch:
 *     summary: Activar o desactivar una unidad
 *     description: Cambia el estado de una unidad entre activa e inactiva.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la unidad.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       404:
 *         description: Unidad no encontrada.
 */
router.get("/materia/:materiaId", verificarJWT, obtenerUnidadesPorMateria);

export default router;