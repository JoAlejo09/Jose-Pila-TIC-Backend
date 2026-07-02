import {Router} from "express"
import { actualizarPerfil, obtenerPerfil, actualizarFotoPerfil } from "../controllers/perfil_controller.js"
import { verificarJWT } from "../middlewares/auth_middleware.js"
import upload from "../middlewares/carga_middleware.js";
/**
 * @swagger
 * tags:
 *   - name: Perfil
 *     description: Gestión del perfil del usuario autenticado. Permite consultar y actualizar la información personal y la fotografía de perfil.
 */
const router = Router();
/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Obtiene la información del usuario autenticado junto con su perfil específico según su rol (estudiante o tutor).
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/",verificarJWT, obtenerPerfil);
/**
 * @swagger
 * /profile/actualizar:
 *   put:
 *     summary: Actualizar perfil
 *     description: Actualiza la información personal del usuario autenticado. Dependiendo del rol, también actualiza la información específica del perfil de estudiante o tutor.
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: José
 *               apellido:
 *                 type: string
 *                 example: Pila
 *               telefono:
 *                 type: string
 *                 example: "0999999999"
 *               direccion:
 *                 type: string
 *                 example: Quito - Ecuador
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 example: "2002-05-20"
 *               institucion:
 *                 type: string
 *                 example: Unidad Educativa Central
 *               nivelAcademico:
 *                 type: string
 *                 example: 3ro BGU
 *               especialidad:
 *                 type: string
 *                 example: Matemáticas
 *               descripcion:
 *                 type: string
 *                 example: Docente con experiencia en educación secundaria.
 *               experiencia:
 *                 type: string
 *                 example: 8 años
 *               titulacion:
 *                 type: string
 *                 example: Licenciado en Matemáticas
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put("/actualizar", verificarJWT, actualizarPerfil)
/**
 * @swagger
 * /profile/foto:
 *   patch:
 *     summary: Actualizar fotografía de perfil
 *     description: Permite cargar una nueva fotografía de perfil. La imagen es almacenada en Cloudinary.
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagen
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Fotografía actualizada correctamente.
 *       400:
 *         description: No se envió ninguna imagen.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch("/foto", verificarJWT, upload.single("imagen"), actualizarFotoPerfil);


export default router;