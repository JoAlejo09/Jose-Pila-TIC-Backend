import { Router } from "express";
import { registrarUsuario, confirmarCuenta } from "../controllers/user_controller.js";

const router = Router();

router.post("/registrar", registrarUsuario);
router.get("/confirmar/:token", confirmarCuenta);

export default router;