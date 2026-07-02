import { Router } from "express";
import {obtenerUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario,activarUsuario} from "../controllers/user_controller.js";
import {verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Administración de usuarios del sistema. Permite crear, consultar, actualizar, activar y desactivar usuarios. Todos los endpoints requieren autenticación mediante JWT y permisos de administrador.
 */
const router = Router();

router.use(verificarJWT, verificarRol("admin"));
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Obtener usuarios
 *     description: Obtiene el listado de usuarios registrados. Permite realizar búsquedas por nombre, apellido o correo electrónico mediante un parámetro de consulta.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Texto para buscar usuarios por nombre, apellido o correo electrónico.
 *         example: jose
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Acceso denegado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", obtenerUsuarios);
/**
 * @swagger
 * /user:
 *   post:
 *     summary: Crear usuario
 *     description: Permite al administrador crear un nuevo usuario. La cuenta se crea verificada y activa.
 *     tags: [Usuarios]
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
 *               - apellido
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: José
 *               apellido:
 *                 type: string
 *                 example: Pila
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jose@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               rol:
 *                 type: string
 *                 enum:
 *                   - admin
 *                   - tutor
 *                   - estudiante
 *                 example: estudiante
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *       400:
 *         description: Datos inválidos o usuario ya registrado.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Acceso denegado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/",crearUsuario);
/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario registrado.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               rol:
 *                 type: string
 *                 enum:
 *                   - admin
 *                   - tutor
 *                   - estudiante
 *               fotoPerfil:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       400:
 *         description: Datos inválidos o ID incorrecto.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put("/:id", actualizarUsuario);
/**
 * @swagger
 * /user/{id}/desactivar:
 *   patch:
 *     summary: Desactivar usuario
 *     description: Cambia el estado del usuario a inactivo sin eliminar su información del sistema.
 *     tags: [Usuarios]
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
 *         description: Usuario desactivado correctamente.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch("/:id/desactivar", desactivarUsuario)
/**
 * @swagger
 * /user/{id}/activar:
 *   patch:
 *     summary: Activar usuario
 *     description: Reactiva un usuario deshabilitado, genera una contraseña temporal y envía un correo electrónico con las nuevas credenciales de acceso.
 *     tags: [Usuarios]
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
 *         description: Usuario activado correctamente.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch("/:id/activar",activarUsuario)


export default router;