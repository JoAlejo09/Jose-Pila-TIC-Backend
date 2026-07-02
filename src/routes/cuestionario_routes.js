import { Router } from "express";

import { crearCuestionario, obtenerCuestionarios, obtenerCuestionariosDisponibles,
         obtenerCuestionarioAdminID,
         obtenerCuestionarioResolver,
         actualizarCuestionario, resolverCuestionario, eliminarCuestionario,
         verificarDiagnosticoMateria, verificarAccesoCuestionario
} from "../controllers/cuestionario_controller.js";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Cuestionarios
 *     description: Gestión de cuestionarios, evaluaciones y resolución por parte de los estudiantes.
 */
const router = Router();

//Para admin
/**
 * @swagger
 * /cuestionarios:
 *   post:
 *     summary: Crear un cuestionario
 *     description: Permite crear un cuestionario manual o dinámico para una materia o tema específico. Solo administradores.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - materia
 *               - nivelAcademico
 *               - alcanceEvaluacion
 *               - tipoEvaluacion
 *               - modoGeneracion
 *               - cantidadPreguntas
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               instrucciones:
 *                 type: string
 *               materia:
 *                 type: string
 *               tema:
 *                 type: string
 *               nivelAcademico:
 *                 type: string
 *                 enum: ["1ro BGU","2do BGU","3ro BGU"]
 *               alcanceEvaluacion:
 *                 type: string
 *                 enum: ["materia","tema"]
 *               tipoEvaluacion:
 *                 type: string
 *                 enum: ["diagnostico","refuerzo"]
 *               modoGeneracion:
 *                 type: string
 *                 enum: ["manual","dinamico"]
 *               preguntas:
 *                 type: array
 *                 items:
 *                   type: string
 *               cantidadPreguntas:
 *                 type: integer
 *               tiempoLimite:
 *                 type: integer
 *               nivel:
 *                 type: string
 *                 enum: ["facil","medio","dificil"]
 *               aleatorio:
 *                 type: boolean
 *               mostrarRevision:
 *                 type: boolean
 *               mostrarRespuestasCorrectas:
 *                 type: boolean
 *               permitirReintento:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Cuestionario creado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Materia o tema no encontrado.
 */
router.post( "/", verificarJWT, verificarRol("admin"), crearCuestionario);
/**
 * @swagger
 * /cuestionarios:
 *   get:
 *     summary: Obtener todos los cuestionarios
 *     description: Devuelve el listado completo de cuestionarios registrados para su administración. Solo administradores.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuestionarios obtenida correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", verificarJWT, verificarRol("admin"), obtenerCuestionarios);
/**
 * @swagger
 * /cuestionarios/admin/{id}:
 *   get:
 *     summary: Obtener un cuestionario para administración
 *     description: Devuelve toda la información de un cuestionario incluyendo sus preguntas para edición. Solo administradores.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario.
 *     responses:
 *       200:
 *         description: Cuestionario obtenido correctamente.
 *       404:
 *         description: Cuestionario no encontrado.
 */
router.get("/admin/:id", verificarJWT, verificarRol("admin"), obtenerCuestionarioAdminID);
/**
 * @swagger
 * /cuestionarios/{id}:
 *   put:
 *     summary: Actualizar un cuestionario
 *     description: Modifica la información de un cuestionario existente. Solo administradores.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cuestionario actualizado correctamente.
 *       404:
 *         description: Cuestionario no encontrado.
 */
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarCuestionario);
/**
 * @swagger
 * /cuestionarios/estado/{id}:
 *   patch:
 *     summary: Activar o desactivar un cuestionario
 *     description: Cambia el estado lógico del cuestionario entre activo e inactivo. Solo administradores.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente.
 *       404:
 *         description: Cuestionario no encontrado.
 */
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), eliminarCuestionario );

//Para estudiante
/**
 * @swagger
 * /cuestionarios/disponibles:
 *   get:
 *     summary: Obtener cuestionarios disponibles
 *     description: Devuelve los cuestionarios activos correspondientes al nivel académico del estudiante autenticado.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuestionarios obtenidos correctamente.
 *       404:
 *         description: Perfil del estudiante no encontrado.
 */
router.get( "/disponibles", verificarJWT, verificarRol("estudiante"), obtenerCuestionariosDisponibles );
/**
 * @swagger
 * /cuestionarios/resolver/{id}:
 *   get:
 *     summary: Obtener cuestionario para resolver
 *     description: Devuelve la evaluación lista para ser respondida por el estudiante.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario.
 *     responses:
 *       200:
 *         description: Cuestionario obtenido correctamente.
 *       403:
 *         description: El cuestionario no pertenece al nivel académico del estudiante.
 *       404:
 *         description: Cuestionario no encontrado.
 */
router.get( "/resolver/:id", verificarJWT, verificarRol("estudiante"), obtenerCuestionarioResolver );
/**
 * @swagger
 * /cuestionarios/resolver/{id}:
 *   post:
 *     summary: Resolver un cuestionario
 *     description: Envía las respuestas del estudiante, calcula la calificación, registra el resultado y actualiza el progreso académico y las recomendaciones.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - respuestas
 *             properties:
 *               respuestas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pregunta:
 *                       type: string
 *                     respuestaUsuario:
 *                       type: string
 *               tiempoEmpleado:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cuestionario resuelto correctamente.
 *       400:
 *         description: Datos inválidos o intento no permitido.
 *       404:
 *         description: Cuestionario no encontrado.
 */
router.post("/resolver/:id", verificarJWT, verificarRol("estudiante"), resolverCuestionario ); 
/**
 * @swagger
 * /cuestionarios/diagnostico/verificar/{materiaId}:
 *   get:
 *     summary: Verificar evaluación diagnóstica
 *     description: Indica si el estudiante ya completó la evaluación diagnóstica de una materia determinada.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materiaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la materia.
 *     responses:
 *       200:
 *         description: Resultado de la verificación.
 *       404:
 *         description: No existe evaluación diagnóstica.
 */
router.get("/diagnostico/verificar/:materiaId",verificarJWT, verificarRol("estudiante"), verificarDiagnosticoMateria)
/**
 * @swagger
 * /cuestionarios/{id}/verificar-acceso:
 *   get:
 *     summary: Verificar acceso al cuestionario
 *     description: Comprueba si el estudiante puede resolver un cuestionario antes de iniciar la evaluación.
 *     tags: [Cuestionarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario.
 *     responses:
 *       200:
 *         description: El estudiante puede resolver el cuestionario.
 *       400:
 *         description: El cuestionario no está disponible o ya fue realizado.
 *       403:
 *         description: El cuestionario no pertenece al nivel académico del estudiante.
 *       404:
 *         description: Cuestionario no encontrado.
 */
router.get("/:id/verificar-acceso", verificarJWT, verificarRol("estudiante"), verificarAccesoCuestionario)

export default router;