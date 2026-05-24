import { Router } from "express";

import { crearCuestionario, obtenerCuestionarios, obtenerCuestionariosDisponibles,
         obtenerCuestionarioAdminID,
         obtenerCuestionarioResolver,
         actualizarCuestionario, resolverCuestionario, eliminarCuestionario,
         verificarDiagnosticoMateria
} from "../controllers/cuestionario_controller.js";

import { verificarJWT, verificarRol } from "../middlewares/auth_middleware.js";

const router = Router();
//Para admin
router.post( "/", verificarJWT, verificarRol("admin"), crearCuestionario);
router.get("/", verificarJWT, verificarRol("admin"), obtenerCuestionarios);
router.get("/admin/:id", verificarJWT, verificarRol("admin"), obtenerCuestionarioAdminID);
router.put("/:id", verificarJWT, verificarRol("admin"), actualizarCuestionario);
router.patch("/estado/:id", verificarJWT, verificarRol("admin"), eliminarCuestionario );

//Para estudiante
router.get( "/disponibles", verificarJWT, verificarRol("estudiante"), obtenerCuestionariosDisponibles );
router.get( "/resolver/:id", verificarJWT, verificarRol("estudiante"), obtenerCuestionarioResolver );
router.post("/resolver/:id", verificarJWT, verificarRol("estudiante"), resolverCuestionario ); 
router.get("/diagnostico/verificar/:materiaId",verificarJWT, verificarRol("estudiante"), verificarDiagnosticoMateria)

export default router;