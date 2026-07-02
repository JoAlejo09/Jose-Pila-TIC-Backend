import { Router } from "express";
import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";
import { actualizarMateria, cambiarEstadoMateria, crearMateria, obtenerMateriaID, obtenerMaterias } from "../controllers/materia_controller.js";

/**
 * @swagger
 * tags:
 *   - name: Materias
 *     description: Administración y consulta de materias académicas. Permite crear, actualizar, consultar y cambiar el estado de las materias del sistema.
 */
const router = Router();

/**
 * @swagger
 * /materias:
 *   get:
 *     summary: Obtener listado de materias
 *     description: Devuelve todas las materias registradas. Puede filtrarse por nivel académico y estado.
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nivelAcademico
 *         schema:
 *           type: string
 *           enum:
 *             - 1ro BGU
 *             - 2do BGU
 *             - 3ro BGU
 *         description: Filtrar por nivel académico.
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de la materia.
 *     responses:
 *       200:
 *         description: Materias obtenidas correctamente.
 *       500:
 *         description: Error del servidor.
 */
router.get("/", verificarJWT, obtenerMaterias);
/**
 * @swagger
 * /materias:
 *   post:
 *     summary: Crear una nueva materia
 *     description: Registra una nueva materia académica. Solo administradores.
 *     tags: [Materias]
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
 *               - nivelAcademico
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Matemáticas
 *               descripcion:
 *                 type: string
 *                 example: Álgebra, geometría y cálculo.
 *               nivelAcademico:
 *                 type: string
 *                 enum:
 *                   - 1ro BGU
 *                   - 2do BGU
 *                   - 3ro BGU
 *     responses:
 *       201:
 *         description: Materia creada correctamente.
 *       400:
 *         description: Datos inválidos o materia existente.
 *       403:
 *         description: Acceso restringido.
 */
router.post("/", verificarJWT, verificarRol("admin"), crearMateria);
/**
 * @swagger
 * /materias/estado/{id}:
 *   patch:
 *     summary: Activar o desactivar una materia
 *     description: Cambia el estado de una materia entre activa e inactiva.
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la materia.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       404:
 *         description: Materia no encontrada.
 */
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoMateria);
/**
 * @swagger
 * /materias/{id}:
 *   put:
 *     summary: Actualizar una materia
 *     description: Modifica la información de una materia existente.
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la materia.
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
 *                 enum:
 *                   - 1ro BGU
 *                   - 2do BGU
 *                   - 3ro BGU
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Materia actualizada correctamente.
 *       400:
 *         description: Ya existe una materia con esos datos.
 *       404:
 *         description: Materia no encontrada.
 */
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarMateria);
/**
 * @swagger
 * /materias/{id}:
 *   get:
 *     summary: Obtener una materia por ID
 *     description: Devuelve la información de una materia específica.
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la materia.
 *     responses:
 *       200:
 *         description: Materia obtenida correctamente.
 *       404:
 *         description: Materia no encontrada.
 */
router.get("/:id", verificarJWT, obtenerMateriaID);

export default router; 