import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger.js"

import userRoutes from "./routes/user_routes.js";
import authRoutes from "./routes/auth_routes.js";
import perfilRoutes from "./routes/perfil_routes.js";
import materiaRoutes from "./routes/materia_routes.js";
import unidadRoutes from "./routes/unidad_routes.js";
import temaRoutes from "./routes/tema_routes.js";
import recursoRoutes from "./routes/recurso_routes.js";

import estudianteRoutes from "./routes/estudiante_routes.js";
import cuestionarioRoutes from "./routes/cuestionario_routes.js";
import preguntaRoutes from "./routes/pregunta_routes.js";
import resultadoRoutes from "./routes/resultado_routes.js"

import progresoRoutes from "./routes/progreso_routes.js";
import recomendacionRoutes from "./routes/recomendacion_routes.js";
import tutoriaRoutes from "./routes/tutoria_routes.js";

import dashboardRoutes from "./routes/dashboard_routes.js";

const app = express();

//Middlewares
app.use(cors(
    {
        origin:[process.env.FRONTEND_URL,
            process.env.FRONTEND_URL_PRODUCTION
        ],
       // credentials:true,
    })
); //Para permitir solicitudes desde un origen especifico (en este caso, el frontend) y permitir el uso de cookies en las solicitudes.

app.use(express.json()); //Para que el servidor pueda entender los datos en formato JSON
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));  //Para que el servidor pueda mostrar la documentacion de la API en formato Swagger

app.get("/", (req, res) => {
    res.send("Bienvenido a la API para el sistema de refuerzos academicos");
});
//Rutas
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", perfilRoutes);
app.use("/api/estudiante", estudianteRoutes);

app.use("/api/materia", materiaRoutes);
app.use("/api/unidad", unidadRoutes);
app.use("/api/tema", temaRoutes);
app.use("/api/recurso",recursoRoutes);

app.use("/api/cuestionario", cuestionarioRoutes);
app.use("/api/pregunta", preguntaRoutes);
app.use("/api/resultado",resultadoRoutes);
app.use("/api/progreso", progresoRoutes);
app.use("/api/recomendacion", recomendacionRoutes);
app.use("/api/tutoria", tutoriaRoutes);
app.use("/api/dashboard", dashboardRoutes);
export default app;