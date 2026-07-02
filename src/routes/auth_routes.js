import { Router } from "express";
import { verificarJWT } from "../middlewares/auth_middleware.js";
import { registrarUsuario, confirmarCuenta, loginUsuario, recuperarContrasena, comprobarToken,  crearNuevoPassword,
    reenviarConfirmacion, cambiarPasswordObligatorio } from "../controllers/user_controller.js";

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Endpoints relacionados con el registro, autenticación y recuperación de credenciales de usuarios.
 */

const router = Router();
//Rutas publicas

/**
 * @swagger
 * /auth/registrar:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Registra un nuevo usuario con rol estudiante o tutor. Después del registro se envía un correo electrónico para confirmar la cuenta.
 *     tags: [Autenticación]
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
 *               - confirmpassword
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
 *               confirmpassword:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               rol:
 *                 type: string
 *                 enum: [estudiante, tutor]
 *                 default: estudiante
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente.
 *       400:
 *         description: Datos inválidos, correo existente o validación fallida.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/registrar", registrarUsuario);
/**
 * @swagger
 * /auth/confirmar/{token}:
 *   get:
 *     summary: Confirmar cuenta
 *     description: Activa la cuenta del usuario utilizando el token enviado por correo electrónico.
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta confirmada correctamente.
 *       400:
 *         description: Token inválido.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/confirmar/:token", confirmarCuenta);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT junto con la información del usuario.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jose@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       400:
 *         description: Credenciales incorrectas o datos incompletos.
 *       403:
 *         description: Cuenta no verificada o deshabilitada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/login", loginUsuario);
/**
 * @swagger
 * /auth/recuperar:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un correo electrónico con un enlace para restablecer la contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jose@gmail.com
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado.
 *       400:
 *         description: Correo inválido o no registrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post ("/recuperar", recuperarContrasena);
/**
 * @swagger
 * /auth/recuperar/{token}:
 *   get:
 *     summary: Verificar token de recuperación
 *     description: Comprueba si el token de recuperación es válido.
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token válido.
 *       400:
 *         description: Token inválido o expirado.
 */
router.get("/recuperar/:token", comprobarToken);
/**
 * @swagger
 * /auth/recuperar/{token}:
 *   post:
 *     summary: Crear nueva contraseña
 *     description: Permite establecer una nueva contraseña utilizando un token de recuperación válido.
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmpassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NuevaPassword123
 *               confirmpassword:
 *                 type: string
 *                 format: password
 *                 example: NuevaPassword123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       400:
 *         description: Token inválido o datos incorrectos.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/recuperar/:token", crearNuevoPassword);
/**
 * @swagger
 * /auth/reenviar-confirmacion:
 *   post:
 *     summary: Reenviar correo de confirmación
 *     description: Envía nuevamente el correo electrónico de confirmación para cuentas que aún no han sido verificadas.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jose@gmail.com
 *     responses:
 *       200:
 *         description: Correo de confirmación reenviado.
 *       400:
 *         description: Correo inválido, cuenta inexistente o ya verificada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/reenviar-confirmacion",reenviarConfirmacion);
/**
 * @swagger
 * /auth/cambiar-password:
 *   patch:
 *     summary: Cambiar contraseña obligatoria
 *     description: Permite al usuario autenticado establecer una nueva contraseña cuando el sistema lo requiere.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmpassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NuevaPassword123
 *               confirmpassword:
 *                 type: string
 *                 format: password
 *                 example: NuevaPassword123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch("/cambiar-password", verificarJWT, cambiarPasswordObligatorio);

export default router;