import { Router } from "express";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

import { crearTutoria, obtenerMisTutorias, cancelarTutoria, calificarTutoria, obtenerTutoriasPendientes,
         aceptarTutoria, liberarTutoria, editarTutoria, obtenerTutoriasTutor, finalizarTutoria, obtenerTodasTutorias,
         cancelarTutoriaAdmin } from "../controllers/tutoria_controller.js";
/**
 * @swagger
 * tags:
 *   - name: Tutorías
 *     description: Gestión de solicitudes de tutorías entre estudiantes, tutores y administradores.
 */
const router = Router();

//Para estudiante
/**
 * @swagger
 * /api/tutoria:
 *   post:
 *     summary: Crear una solicitud de tutoría
 *     description: Permite a un estudiante solicitar una tutoría indicando materia, tema, modalidad, fecha y duración.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Solicitud creada correctamente.
 *       400:
 *         description: Datos inválidos o incompletos.
 *       401:
 *         description: No autenticado.
 */
router.post( "/", verificarJWT, verificarRol("estudiante"), crearTutoria);
/**
 * @swagger
 * /api/tutoria/mis-tutorias:
 *   get:
 *     summary: Obtener mis tutorías
 *     description: Devuelve todas las solicitudes de tutoría realizadas por el estudiante autenticado.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutorías obtenidas correctamente.
 *       401:
 *         description: No autenticado.
 */
router.get( "/mis-tutorias", verificarJWT, verificarRol("estudiante"), obtenerMisTutorias);
/**
 * @swagger
 * /api/tutoria/cancelar/{id}:
 *   put:
 *     summary: Cancelar una tutoría
 *     description: Permite al estudiante cancelar una tutoría antes de que haya sido realizada.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tutoría.
 *     responses:
 *       200:
 *         description: Tutoría cancelada correctamente.
 *       404:
 *         description: Tutoría no encontrada.
 */
router.put( "/cancelar/:id", verificarJWT, verificarRol("estudiante"), cancelarTutoria);
/**
 * @swagger
 * /api/tutoria/calificar/{id}:
 *   put:
 *     summary: Calificar una tutoría
 *     description: Permite al estudiante calificar una tutoría finalizada.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tutoría.
 *     responses:
 *       200:
 *         description: Tutoría calificada correctamente.
 *       400:
 *         description: La tutoría aún no puede calificarse.
 */
router.put( "/calificar/:id", verificarJWT, verificarRol("estudiante"), calificarTutoria);
/**
 * @swagger
 * /api/tutoria/editar/{id}:
 *   put:
 *     summary: Editar una solicitud de tutoría
 *     description: Permite modificar una solicitud únicamente mientras permanezca en estado pendiente.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tutoría.
 *     responses:
 *       200:
 *         description: Tutoría actualizada correctamente.
 *       403:
 *         description: No autorizado.
 */
router.put( "/editar/:id", verificarJWT, verificarRol("estudiante"), editarTutoria);

// Para tutores
/**
 * @swagger
 * /api/tutoria/pendientes:
 *   get:
 *     summary: Obtener solicitudes pendientes
 *     description: Permite a un tutor visualizar todas las solicitudes de tutoría pendientes.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas correctamente.
 */
router.get( "/pendientes", verificarJWT, verificarRol("tutor"), obtenerTutoriasPendientes);
/**
 * @swagger
 * /api/tutoria/aceptar/{id}:
 *   put:
 *     summary: Aceptar una tutoría
 *     description: Permite a un tutor aceptar una solicitud pendiente.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tutoría.
 *     responses:
 *       200:
 *         description: Tutoría aceptada correctamente.
 *       400:
 *         description: La tutoría ya fue aceptada.
 */
router.put( "/aceptar/:id", verificarJWT, verificarRol("tutor"), aceptarTutoria);
/**
 * @swagger
 * /api/tutoria/liberar/{id}:
 *   put:
 *     summary: Liberar una tutoría
 *     description: Permite al tutor liberar una tutoría aceptada para que otro tutor pueda tomarla.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tutoría.
 *     responses:
 *       200:
 *         description: Tutoría liberada correctamente.
 */
router.put( "/liberar/:id", verificarJWT, verificarRol("tutor"), liberarTutoria);
/**
 * @swagger
 * /api/tutoria/mis-tutorias-tutor:
 *   get:
 *     summary: Obtener mis tutorías como tutor
 *     description: Devuelve todas las tutorías aceptadas por el tutor autenticado.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutorías obtenidas correctamente.
 */
router.get( "/mis-tutorias-tutor", verificarJWT, verificarRol("tutor"), obtenerTutoriasTutor);
/**
 * @swagger
 * /api/tutoria/finalizar/{id}:
 *   put:
 *     summary: Finalizar una tutoría
 *     description: Permite al tutor marcar una tutoría como realizada y registrar una observación.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tutoría.
 *     responses:
 *       200:
 *         description: Tutoría finalizada correctamente.
 */
router.put( "/finalizar/:id", verificarJWT, verificarRol("tutor"), finalizarTutoria );

// Para administrador
/**
 * @swagger
 * /api/tutoria/admin/todas:
 *   get:
 *     summary: Obtener todas las tutorías
 *     description: Permite al administrador visualizar todas las tutorías registradas en el sistema.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutorías obtenidas correctamente.
 */
router.get( "/admin/todas", verificarJWT, verificarRol("admin"), obtenerTodasTutorias );
/**
 * @swagger
 * /api/tutoria/admin/cancelar/{id}:
 *   put:
 *     summary: Cancelar una tutoría como administrador
 *     description: Permite al administrador cancelar cualquier tutoría registrada.
 *     tags: [Tutorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tutoría.
 *     responses:
 *       200:
 *         description: Tutoría cancelada correctamente.
 *       404:
 *         description: Tutoría no encontrada.
 */
router.put( "/admin/cancelar/:id", verificarJWT, verificarRol("admin"), cancelarTutoriaAdmin);

export default router;