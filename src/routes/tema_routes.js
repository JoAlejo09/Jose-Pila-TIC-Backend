import { Router } from "express";
import { actualizarTema, cambiarEstadoTema, crearTema, obtenerTemaId, obtenerTemas,
    obtenerTemasPorUnidad} from "../controllers/tema_controller.js";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Temas
 *     description: Gestión de los temas académicos. Permite administrar los temas de cada unidad y consultar los contenidos disponibles.
 */
const router = Router();

/**
 * @swagger
 * /temas:
 *   get:
 *     summary: Obtener listado de temas
 *     description: Devuelve todos los temas registrados junto con la unidad y la materia a la que pertenecen.
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Temas obtenidos correctamente.
 *       500:
 *         description: Error del servidor.
 */
router.get("/", verificarJWT, obtenerTemas);
/**
 * @swagger
 * /temas/{id}:
 *   get:
 *     summary: Obtener un tema por ID
 *     description: Devuelve la información detallada de un tema específico.
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema.
 *     responses:
 *       200:
 *         description: Tema obtenido correctamente.
 *       404:
 *         description: Tema no encontrado.
 */
router.get("/:id", verificarJWT, obtenerTemaId);
/**
 * @swagger
 * /temas:
 *   post:
 *     summary: Crear un nuevo tema
 *     description: Registra un nuevo tema asociado a una unidad académica. Solo administradores.
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unidad
 *               - nombre
 *             properties:
 *               unidad:
 *                 type: string
 *                 description: ID de la unidad.
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               orden:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Tema creado correctamente.
 *       400:
 *         description: Datos inválidos o tema duplicado.
 *       404:
 *         description: Unidad no encontrada.
 */
router.post("/", verificarJWT, verificarRol("admin"), crearTema);
/**
 * @swagger
 * /temas/estado/{id}:
 *   patch:
 *     summary: Activar o desactivar un tema
 *     description: Cambia el estado de un tema entre activo e inactivo.
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       404:
 *         description: Tema no encontrado.
 */
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoTema);
/**
 * @swagger
 * /temas/{id}:
 *   put:
 *     summary: Actualizar un tema
 *     description: Modifica la información de un tema existente.
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema.
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
 *               orden:
 *                 type: integer
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tema actualizado correctamente.
 *       404:
 *         description: Tema no encontrado.
 */
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarTema);
/**
 * @swagger
 * /temas/unidad/{unidadId}:
 *   get:
 *     summary: Obtener temas de una unidad
 *     description: Devuelve los temas pertenecientes a una unidad específica. Permite filtrar por estado y nivel académico.
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la unidad.
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado.
 *       - in: query
 *         name: nivelAcademico
 *         schema:
 *           type: string
 *         description: Filtrar por nivel académico.
 *     responses:
 *       200:
 *         description: Temas obtenidos correctamente.
 *       404:
 *         description: Unidad no encontrada.
 */
router.get("/unidad/:unidadId",verificarJWT, obtenerTemasPorUnidad)

export default router;