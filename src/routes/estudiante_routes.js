import { Router } from "express";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";
import { completarPerfilEstudiante, obtenerPerfilEstudiante, actualizarPerfilEstudiante,
         obtenerMateriasEstudiante, obtenerTemasPorMateria, obtenerTemasPorUnidad,obtenerRecursosPorTema,
         obtenerRecursoPorId, agregarMateriaFavorita, quitarMateriaFavorita, agregarTemaFavorito, quitarTemaFavorito
} from "../controllers/estudiante_controller.js";
import { obtenerUnidadesPorMateriaEstudiante } from "../controllers/unidad_controller.js";

/**
 * @swagger
 * tags:
 *   - name: Estudiantes
 *     description: Gestión del perfil académico del estudiante, materias, temas, recursos y elementos favoritos. Todos los endpoints requieren autenticación mediante JWT y rol de estudiante.
 */
const router = Router();

// COMPLETAR PERFIL
/**
 * @swagger
 * /estudiantes/completar-perfil:
 *   post:
 *     summary: Completar perfil del estudiante
 *     description: Registra la información académica inicial del estudiante y marca el perfil como completo.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telefono
 *               - institucion
 *               - nivelAcademico
 *             properties:
 *               telefono:
 *                 type: string
 *                 example: "0999999999"
 *               institucion:
 *                 type: string
 *                 example: Unidad Educativa Central
 *               nivelAcademico:
 *                 type: string
 *                 enum:
 *                   - 1ro BGU
 *                   - 2do BGU
 *                   - 3ro BGU
 *               direccion:
 *                 type: string
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Perfil completado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       403:
 *         description: Acceso solo para estudiantes.
 *       404:
 *         description: Usuario no encontrado.
 */
router.post("/completar-perfil", verificarJWT, verificarRol("estudiante"), completarPerfilEstudiante);
/**
 * @swagger
 * /estudiantes/perfil:
 *   get:
 *     summary: Obtener perfil del estudiante
 *     description: Devuelve la información completa del perfil del estudiante autenticado.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente.
 *       403:
 *         description: Acceso restringido.
 *       404:
 *         description: Perfil no encontrado.
 */
router.get("/perfil", verificarJWT, verificarRol("estudiante"), obtenerPerfilEstudiante);
/**
 * @swagger
 * /estudiantes/perfil:
 *   put:
 *     summary: Actualizar perfil del estudiante
 *     description: Actualiza la información personal y académica del estudiante.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telefono:
 *                 type: string
 *               institucion:
 *                 type: string
 *               nivelAcademico:
 *                 type: string
 *                 enum:
 *                   - 1ro BGU
 *                   - 2do BGU
 *                   - 3ro BGU
 *               direccion:
 *                 type: string
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Perfil no encontrado.
 */
router.put("/perfil", verificarJWT, verificarRol("estudiante"), actualizarPerfilEstudiante);

// MATERIAS
/**
 * @swagger
 * /estudiantes/materias:
 *   get:
 *     summary: Obtener materias del estudiante
 *     description: Devuelve las materias disponibles para el nivel académico del estudiante, separando favoritas y otras materias.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Materias obtenidas correctamente.
 *       403:
 *         description: Perfil incompleto o acceso denegado.
 *       404:
 *         description: Estudiante no encontrado.
 */
router.get("/materias", verificarJWT, verificarRol("estudiante"), obtenerMateriasEstudiante);
/**
 * @swagger
 * /estudiantes/favoritos/{id}:
 *   post:
 *     summary: Agregar materia a favoritos
 *     description: Agrega una materia a la lista de materias favoritas del estudiante.
 *     tags: [Estudiantes]
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
 *         description: Materia agregada correctamente.
 *       400:
 *         description: La materia ya está en favoritos.
 *       404:
 *         description: Materia no encontrada.
 */
router.post("/favoritos/:id", verificarJWT, verificarRol("estudiante"), agregarMateriaFavorita);
/**
 * @swagger
 * /estudiantes/favoritos/{id}:
 *   delete:
 *     summary: Eliminar materia de favoritos
 *     description: Elimina una materia de la lista de favoritas del estudiante.
 *     tags: [Estudiantes]
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
 *         description: Materia eliminada correctamente.
 *       404:
 *         description: Perfil no encontrado.
 */
router.delete("/favoritos/:id", verificarJWT, verificarRol("estudiante"), quitarMateriaFavorita);
// UNIDADES
/**
 * @swagger
 * /estudiantes/materia/{materiaId}:
 *   get:
 *     summary: Obtener unidades disponibles para un estudiante
 *     description: Devuelve las unidades activas de una materia para el estudiante autenticado. Si existe una evaluación diagnóstica pendiente, solicita completarla antes de permitir el acceso.
 *     tags: [Estudiantes]
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
 *         description: Unidades obtenidas correctamente.
 *       403:
 *         description: El estudiante debe completar la evaluación diagnóstica.
 *       404:
 *         description: Perfil de estudiante no encontrado.
 */

router.get("/materias/:materiaId/unidades",verificarJWT, verificarRol("estudiante"), obtenerUnidadesPorMateriaEstudiante)
// TEMAS
/**
 * @swagger
 * /estudiantes/temas/unidad/{unidadId}:
 *   get:
 *     summary: Obtener temas por unidad
 *     description: Devuelve los temas pertenecientes a una unidad académica.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Temas obtenidos correctamente.
 *       404:
 *         description: Unidad no encontrada.
 */
router.get("/temas/unidad/:unidadId",verificarJWT, obtenerTemasPorUnidad);
/**
 * @swagger
 * /estudiantes/temas/{materiaId}:
 *   get:
 *     summary: Obtener temas por materia
 *     description: Obtiene todos los temas disponibles para una materia según el nivel académico del estudiante.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materiaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Temas obtenidos correctamente.
 *       404:
 *         description: Materia no encontrada.
 */
router.get("/temas/:materiaId", verificarJWT, verificarRol("estudiante"), obtenerTemasPorMateria);
/**
 * @swagger
 * /estudiantes/favoritos-temas/{id}:
 *   post:
 *     summary: Agregar tema a favoritos
 *     description: Agrega un tema a la lista de favoritos del estudiante.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tema agregado correctamente.
 *       400:
 *         description: El tema ya está registrado como favorito.
 *       404:
 *         description: Tema no encontrado.
 */
router.post( "/favoritos-temas/:id", verificarJWT, verificarRol("estudiante"), agregarTemaFavorito );
/**
 * @swagger
 * /estudiantes/favoritos-temas/{id}:
 *   delete:
 *     summary: Eliminar tema de favoritos
 *     description: Elimina un tema de la lista de favoritos del estudiante.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tema eliminado correctamente.
 *       404:
 *         description: Tema no encontrado.
 */
router.delete( "/favoritos-temas/:id", verificarJWT, verificarRol("estudiante"), quitarTemaFavorito );

// RECURSOS
/**
 * @swagger
 * /estudiantes/recursos/{temaId}:
 *   get:
 *     summary: Obtener recursos de un tema
 *     description: Devuelve todos los recursos activos asociados a un tema.
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: temaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recursos obtenidos correctamente.
 *       403:
 *         description: El tema no pertenece al nivel académico del estudiante.
 *       404:
 *         description: Tema no encontrado.
 */
router.get("/recursos/:temaId", verificarJWT, verificarRol("estudiante"), obtenerRecursosPorTema );
/**
 * @swagger
 * /estudiantes/recurso/{id}:
 *   get:
 *     summary: Obtener recurso por identificador
 *     description: Devuelve la información detallada de un recurso específico.
 *     tags: [Estudiantes]
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
 *         description: El recurso no corresponde al nivel académico del estudiante.
 *       404:
 *         description: Recurso no encontrado.
 */
router.get( "/recurso/:id", verificarJWT, verificarRol("estudiante"), obtenerRecursoPorId );

export default router;