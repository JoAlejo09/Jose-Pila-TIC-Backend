import {Router} from "express";
import { verificarJWT, verificarRol} from "../middlewares/auth_middleware.js";
import { actualizarRecurso, cambiarEstadoRecurso, crearRecurso, obtenerRecursoID, obtenerRecursos } from "../controllers/recurso_controller.js"
import upload from "../middlewares/carga_middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Recursos
 *     description: Gestión de los recursos de aprendizaje asociados a los temas académicos. Permite administrar material teórico, imágenes, documentos PDF y videos de YouTube.
 */
const router = Router();
/**
 * @swagger
 * /recursos:
 *   get:
 *     summary: Obtener listado de recursos
 *     description: Devuelve todos los recursos registrados con la información del tema, unidad y materia correspondiente.
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recursos obtenidos correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", verificarJWT, obtenerRecursos);
/**
 * @swagger
 * /recursos/{id}:
 *   get:
 *     summary: Obtener un recurso por ID
 *     description: Devuelve la información de un recurso específico. Si el usuario es estudiante, también registra la visualización del recurso para el seguimiento de su progreso académico.
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recurso.
 *     responses:
 *       200:
 *         description: Recurso obtenido correctamente.
 *       403:
 *         description: El recurso no está disponible para el nivel académico del estudiante.
 *       404:
 *         description: Recurso no encontrado.
 */
router.get("/:id", verificarJWT, obtenerRecursoID);
/**
 * @swagger
 * /recursos:
 *   post:
 *     summary: Crear un recurso académico
 *     description: Registra un nuevo recurso asociado a un tema. Admite recursos de tipo teoría, PDF, imagen o video de YouTube. Solo administradores.
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - tema
 *               - titulo
 *               - tipo
 *             properties:
 *               tema:
 *                 type: string
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum:
 *                   - teoria
 *                   - pdf
 *                   - youtube
 *                   - imagen
 *               url:
 *                 type: string
 *               contenido:
 *                 type: string
 *               nivelDificultad:
 *                 type: string
 *                 enum:
 *                   - basico
 *                   - intermedio
 *                   - avanzado
 *               modoImagen:
 *                 type: string
 *                 enum:
 *                   - url
 *                   - cloudinary
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Recurso creado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Tema no encontrado.
 */
router.post("/", verificarJWT, verificarRol("admin"), upload.single("imagen"),crearRecurso);
/**
 * @swagger
 * /recursos/{id}:
 *   put:
 *     summary: Actualizar un recurso
 *     description: Modifica la información de un recurso existente. Solo administradores.
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recurso.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tema:
 *                 type: string
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipo:
 *                 type: string
 *               url:
 *                 type: string
 *               contenido:
 *                 type: string
 *               nivelDificultad:
 *                 type: string
 *               estado:
 *                 type: boolean
 *               modoImagen:
 *                 type: string
 *                 enum:
 *                   - url
 *                   - cloudinary
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Recurso actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Recurso o tema no encontrado.
 */
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), cambiarEstadoRecurso);
/**
 * @swagger
 * /recursos/estado/{id}:
 *   patch:
 *     summary: Activar o desactivar un recurso
 *     description: Cambia el estado de un recurso entre activo e inactivo. Solo administradores.
 *     tags: [Recursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recurso.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       404:
 *         description: Recurso no encontrado.
 */
router.put("/:id",verificarJWT, verificarRol("admin"), actualizarRecurso);

export default router;